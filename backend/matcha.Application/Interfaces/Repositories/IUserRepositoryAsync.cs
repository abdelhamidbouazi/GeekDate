using matcha.Application.Dtos.Users;
using matcha.Application.Specifications;
using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IUserRepositoryAsync : IGenericRepoAsync<AppUser>
    {
        Task<AppUser> GetUserProfile(Guid id);
        Task<AppUser> GetUserWithPhotosById(Guid id);
        Task<AppUser> GetUserWithPhotosByUserNameAsync(string userName);
        Task<IEnumerable<AppUser>> GetProfileViewersAsync(Guid id);
        Task<IEnumerable<AppUser>> GetprofileLikesAsync(Guid userId);
        Task<AppUser> GetUserWithInterestsByIdAsync(Guid id);
        Task<IEnumerable<BrowseUserDto>> GetMatchingUsersAsync(BrowseUsersSpecification specification);
        Task<IEnumerable<BrowseUserDto>> SearchUsersAsync(SearchUsersSpecification spec);
    }
}
