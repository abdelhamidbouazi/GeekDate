using sparkdates.Application.Dtos.Users;
using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IUserSearchPreferencesServiceAsync
    {
        Task<SearchPreferencesDto> GetByUserIdAsync(Guid userId);
        Task UpdateAsync(Guid userId, UserSearchPreference userPreference);
        Task<bool> DeleteByUserIdAsync(Guid userId);
    }
}
