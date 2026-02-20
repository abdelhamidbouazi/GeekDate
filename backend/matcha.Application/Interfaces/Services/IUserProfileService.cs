using matcha.Application.Dtos.Profile;
using matcha.Application.Dtos.UserBlocks;
using matcha.Application.Dtos.UserLikes;
using matcha.Application.Dtos.Users;
using matcha.Application.Features.Profile.Commands.CompleteUserPreferences;
using matcha.Application.Features.Profile.Commands.UpdateUserProfile;
using matcha.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace matcha.Application.Interfaces.Services
{
    public interface IUserProfileService
    {
        Task<IReadOnlyCollection<GetAllUserProfilesDto>> GetAllAsync();
        Task<GetUserProfileByIdDto> GetByIdAsync(Guid id);
        Task<UserProfileDto> GetUserProfile(Guid id);
        Task<UserProfileDto> CompleteBasicUserProfileAsync(BasicUserProfileDto basicUserProfileDto);
        Task<UserProfileDto> CompleteUserPreferencesAsync(CompleteUserPreferencesCommand userPreferencesDto);
        Task<bool> UpdateUserProfileAsync(UpdateUserProfileCommand profuleCommand, Guid userId);
        Task<bool> DeleteUser(Guid id);
        Task<GetUserLikesDto> GetUserLikesAsync(Guid userId);
        Task<GetUserBlocksDto> GetUserBlocksAsync(Guid userId);
        Task<bool> SetProfilePictureAsync(Guid userId, Guid pictureId);
        Task<bool> DeletePhotoAsync(Guid userId, Guid photoId);
        Task<bool> UploadPhotosAsync(List<IFormFile> photos, Guid userId);
        Task<IEnumerable<Photo>> GetUserPhotosAsync(Guid userId);
        Task<bool> SetUserLocationAsync(Guid userId, double latitude, double longitude);
        Task<ConnectedUserProfileDto> GetConnectedProfileAsync(Guid userId);
        Task<IEnumerable<UserProfileViewerDto>> GetWhoViewedMeAsync(Guid userId);
        Task<IEnumerable<UserProfileLikedDto>> GetWhoLikedMeAsync(Guid userId);
    }
}
