using matcha.Application.Dtos.Interests;
using matcha.Application.Helper;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;

namespace matcha.Infrastructure.Repositories
{
    public class InterestRepositoryAsync : GenericRepoAsync<Interest>, IInterestRepositoryAsync
    {
        public InterestRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Interest> queryBuilder) : base(databaseService, queryBuilder) { }

        public async Task<IEnumerable<InterestDto>> GetInterestsWithNamesByUserIdAsync(Guid userId)
        {
            var condition = new Condition($"{nameof(UserInterest)}s.{nameof(UserInterest.UserId)}=@userId", new SqlParameter("@userId", userId));
            var query = _builder.InnerJoin<Interest, UserInterest>(nameof(Interest.Id), nameof(UserInterest.InterestId), false)
                .Where(condition)
                .Build();

            var interests = await _database.QueryAndMapAsync<InterestDto>(query, _builder.GetParameters());
            return interests;
        }
    }
}
