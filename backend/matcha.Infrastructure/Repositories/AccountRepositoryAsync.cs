using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;

namespace sparkdates.Infrastructure.Repositories
{
    public class AccountRepositoryAsync : GenericRepoAsync<AppUser>, IAccountRepositoryAsync
    {
        public AccountRepositoryAsync(IDatabaseService database, IQueryBuilder<AppUser> queryBuilder) : base(database, queryBuilder)
        {

        }
    }
}