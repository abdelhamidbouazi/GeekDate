using matcha.Application.Helper;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;


namespace matcha.Infrastructure.Repositories
{
    public class ResetPasswordRepositoryAsync : GenericRepoAsync<ResetPassword>, IResetPasswordRepositoryAsync
    {
        public ResetPasswordRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<ResetPassword> queryBuilder) : base(databaseService, queryBuilder) { }

        public async Task<ResetPassword> GetLastUserTokenAsync(Guid userId)
        {
            var query = _builder.SelectTop(1)
                 .Where(new Condition($"{nameof(ResetPassword.UserId)} = @userId", new SqlParameter("@userId", userId)))
                 .OrderBy($"{nameof(ResetPassword.ExpiryDate)} desc")
                 .Build();
            var token = await _database.QueryAndMapSingleAsync<ResetPassword>(query, _builder.GetParameters());

            return token;
        }
    }
}
