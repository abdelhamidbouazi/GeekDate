using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;

namespace sparkdates.Infrastructure.Repositories
{
    public class UserLikesRepositoryAsync : GenericRepoAsync<UserLike>, IUserLikesRepositoryAsync
    {
        public UserLikesRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<UserLike> queryBuilder) : base(databaseService, queryBuilder) { }
    }
}
