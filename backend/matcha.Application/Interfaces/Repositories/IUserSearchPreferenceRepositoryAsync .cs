using matcha.Application.Dtos.Users;
using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IUserSearchPreferenceRepositoryAsync : IGenericRepoAsync<UserSearchPreference>
    {
        Task<SearchPreferencesDto?> GetByUserIdAsync(Guid userId);
        Task CreateDefaultUserPreferencesAsync(Guid userId);
    }
}
