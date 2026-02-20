using matcha.Application.Helper;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;
using System.Linq.Expressions;

namespace matcha.Infrastructure.Repositories
{
    public class UserInterestsRepositoryAsync : GenericRepoAsync<UserInterest>, IUserInterestsRepositoyAsync
    {
        public UserInterestsRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<UserInterest> queryBuilder) : base(databaseService, queryBuilder) { }

        public async Task<IReadOnlyList<UserInterest>> GetUserInterestsByUserIdAsync(Guid userId)
        {
            Expression<Func<UserInterest, bool>> predicate = (interest) => interest.UserId == userId;
            var condition = new Condition(_expressionVisitor.GetWhereClause(predicate), GetSqlParameters(_expressionVisitor.GetParameters()));
            var query = _builder.Select()
                .Where(condition)
                .Build();
            return await _database.QueryAndMapAsync<UserInterest>(query, _builder.GetParameters());
        }
    }
}
