using matcha.Application.Helper;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;

namespace matcha.Infrastructure.Repositories
{
    public class RefreshTokenRepositoryAsync : GenericRepoAsync<RefreshToken>, IRefreshTokenRepositoryAsync
    {
        public RefreshTokenRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<RefreshToken> queryBuilder) : base(databaseService, queryBuilder) { }

        public async Task<RefreshToken?> GetByTokenAsync(string refreshToken)
        {
            var condition = new Condition($"{nameof(RefreshToken.Token)}=@token", new SqlParameter("@token", refreshToken));
            var query = _builder.Select()
                .Where(condition)
                .Build();

            var token = await _database.QueryAndMapSingleAsync<RefreshToken>(query, _builder.GetParameters());
            return token;
        }


        public async Task<IEnumerable<RefreshToken>> GetAllTokensByUserIdAsync(Guid userId)
        {
            var condition = new Condition($"{nameof(RefreshToken.UserId)}=@userId", new SqlParameter("@userId", userId));
            var query = _builder.Select()
                .Where(condition)
                .Build();

            var tokens = await _database.QueryAndMapAsync<RefreshToken>(query, _builder.GetParameters());
            return tokens;
        }

        public async Task<IEnumerable<RefreshToken>> GetAllTokensByUserIdAndIpAddressAsync(Guid userId, string ipAddress)
        {
            _builder.ClearAll();
            var condition = new Condition($"{nameof(RefreshToken.UserId)} = @userId AND {nameof(RefreshToken.IpAddress)} = @ipAddress",
                new SqlParameter("@userId", userId),
                new SqlParameter("@ipAddress", ipAddress));

            var query = _builder.Select()
                .Where(condition)
                .Build();

            return await _database.QueryAndMapAsync<RefreshToken>(query, _builder.GetParameters());
        }

        public async Task DeleteRefreshTokenByUserIdAndIp(Guid userId, string ipAddress)
        {
            var condition = new Condition(" UserId = @userId AND IpAddress = @ipAddress",
                new SqlParameter("@userId", userId),
                new SqlParameter("@ipAddress", ipAddress));

            var query = _builder.Delete(condition).BuildCommand();
            await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
        }

        public async Task<RefreshToken> GetLastRefreshTokenByUserIdAsync(Guid userId, string ipAddress)
        {
            var condition = new Condition($"{nameof(RefreshToken.UserId)} = @userId AND {nameof(RefreshToken.IpAddress)} = @ipAddress",
               new SqlParameter("@userId", userId),
               new SqlParameter("@ipAddress", ipAddress));

            var query = _builder.SelectTop(1)
                .OrderBy($"{nameof(RefreshToken.CreatedAt)} desc")
                .Where(condition)
                .Build();

            return await _database.QueryAndMapSingleAsync<RefreshToken>(query, _builder.GetParameters());
        }
    }
}
