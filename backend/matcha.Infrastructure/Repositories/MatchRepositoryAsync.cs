using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;

namespace sparkdates.Infrastructure.Repositories
{
    public class MatchRepositoryAsync : GenericRepoAsync<Match>, IMatchRepositoryAsync
    {
        public MatchRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Match> queryBuilder) : base(databaseService, queryBuilder)
        {
        }
    }
}
