using sparkdates.Application.Dtos.Interests;
using sparkdates.Application.Helper;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;

namespace sparkdates.Infrastructure.Repositories
{
    public class InterestRepositoryAsync : GenericRepoAsync<Interest>, IInterestRepositoryAsync
    {
        public InterestRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Interest> queryBuilder) : base(databaseService, queryBuilder) { }

        public async Task<IEnumerable<InterestDto>> GetInterestsWithNamesByUserIdAsync(Guid userId)
        {
            var condition = new Condition($"{nameof(UserInterest)}s.{nameof(UserInterest.UserId)}=@userId", new SqlParameter("@userId", userId));
            var query = _builder.Select($"{nameof(Interest)}s.{nameof(Interest.Id)}", $"{nameof(Interest)}s.{nameof(Interest.Name)}")
                .InnerJoin<Interest, UserInterest>(nameof(Interest.Id), nameof(UserInterest.InterestId), false)
                .Where(condition)
                .Build();

            var interests = await _database.QueryAndMapAsync<InterestDto>(query, _builder.GetParameters());
            return interests;
        }
    }
}
