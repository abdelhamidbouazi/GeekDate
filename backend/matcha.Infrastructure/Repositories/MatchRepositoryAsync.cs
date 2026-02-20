using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;

namespace matcha.Infrastructure.Repositories
{
    public class MatchRepositoryAsync : GenericRepoAsync<Match>, IMatchRepositoryAsync
    {
        public MatchRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Match> queryBuilder) : base(databaseService, queryBuilder)
        {
        }
    }
}
