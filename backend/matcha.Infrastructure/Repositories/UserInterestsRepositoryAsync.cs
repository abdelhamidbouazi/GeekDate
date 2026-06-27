using sparkdates.Application.Helper;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;
using System.Linq.Expressions;

namespace sparkdates.Infrastructure.Repositories
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
