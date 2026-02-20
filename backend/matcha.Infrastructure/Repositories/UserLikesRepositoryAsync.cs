using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;

namespace matcha.Infrastructure.Repositories
{
    public class UserLikesRepositoryAsync : GenericRepoAsync<UserLike>, IUserLikesRepositoryAsync
    {
        public UserLikesRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<UserLike> queryBuilder) : base(databaseService, queryBuilder) { }
    }
}
