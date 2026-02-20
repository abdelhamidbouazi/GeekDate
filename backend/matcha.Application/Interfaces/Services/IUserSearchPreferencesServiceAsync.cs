using matcha.Application.Dtos.Users;
using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Services
{
    public interface IUserSearchPreferencesServiceAsync
    {
        Task<SearchPreferencesDto> GetByUserIdAsync(Guid userId);
        Task UpdateAsync(Guid userId, UserSearchPreference userPreference);
        Task<bool> DeleteByUserIdAsync(Guid userId);
    }
}
