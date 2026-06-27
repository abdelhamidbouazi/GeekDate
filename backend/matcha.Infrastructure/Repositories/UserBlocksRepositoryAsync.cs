using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;

namespace sparkdates.Infrastructure.Repositories
{
    public class UserBlocksRepositoryAsync : GenericRepoAsync<UserBlock>, IUserBlocksRepositoryAsync
    {
        public UserBlocksRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<UserBlock> queryBuilder) : base(databaseService, queryBuilder) { }
    }
}
