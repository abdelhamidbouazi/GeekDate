using sparkdates.Application.Helper;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;


namespace sparkdates.Infrastructure.Repositories
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
