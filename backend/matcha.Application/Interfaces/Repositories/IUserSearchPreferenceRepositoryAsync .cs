using sparkdates.Application.Dtos.Users;
using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Repositories
{
    public interface IUserSearchPreferenceRepositoryAsync : IGenericRepoAsync<UserSearchPreference>
    {
        Task<SearchPreferencesDto?> GetByUserIdAsync(Guid userId);
        Task CreateDefaultUserPreferencesAsync(Guid userId);
    }
}
