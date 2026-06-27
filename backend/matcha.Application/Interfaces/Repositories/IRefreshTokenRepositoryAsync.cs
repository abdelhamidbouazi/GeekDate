using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Repositories
{
    public interface IRefreshTokenRepositoryAsync : IGenericRepoAsync<RefreshToken>
    {
        Task<RefreshToken> GetByTokenAsync(string refreshToken);
        Task<IEnumerable<RefreshToken>> GetAllTokensByUserIdAsync(Guid userId);
        Task<IEnumerable<RefreshToken>> GetAllTokensByUserIdAndIpAddressAsync(Guid userId, string ipAddress);
        Task DeleteRefreshTokenByUserIdAndIp(Guid userId, string ipAddress);

        Task<RefreshToken> GetLastRefreshTokenByUserIdAsync(Guid userId, string ipAddress);
    }
}
