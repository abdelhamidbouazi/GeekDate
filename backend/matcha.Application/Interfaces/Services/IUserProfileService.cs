using sparkdates.Application.Dtos.Profile;
using sparkdates.Application.Dtos.UserBlocks;
using sparkdates.Application.Dtos.UserLikes;
using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Features.Profile.Commands.CompleteUserPreferences;
using sparkdates.Application.Features.Profile.Commands.UpdateUserProfile;
using sparkdates.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace sparkdates.Application.Interfaces.Services
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
        Task<GetUsersBlocksDto> GetUserBlocksAsync(Guid userId);
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
