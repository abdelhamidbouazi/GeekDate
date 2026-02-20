using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;

namespace matcha.Infrastructure.Repositories
{
    public class UserBlocksRepositoryAsync : GenericRepoAsync<UserBlock>, IUserBlocksRepositoryAsync
    {
        public UserBlocksRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<UserBlock> queryBuilder) : base(databaseService, queryBuilder) { }
    }
}
