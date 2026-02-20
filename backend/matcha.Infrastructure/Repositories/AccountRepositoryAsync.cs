using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;

namespace matcha.Infrastructure.Repositories
{
    public class AccountRepositoryAsync : GenericRepoAsync<AppUser>, IAccountRepositoryAsync
    {
        public AccountRepositoryAsync(IDatabaseService database, IQueryBuilder<AppUser> queryBuilder) : base(database, queryBuilder)
        {

        }
    }
}