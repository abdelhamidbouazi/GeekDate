using sparkdates.Application.Dtos.Users;
using sparkdates.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IUserServiceAsync
    {
        Task<IReadOnlyCollection<AppUser>> GetUsersAsync();
        Task<AppUser> GetUserByIdAsync(Guid userId);
        Task<AppUser> GetUserByNameAsync(string name);
        Task<ImageDto> UploadImage(Guid userId, IFormFile file, bool isMain);
        Task<bool> SetMainPhoto(Guid photoId, Guid userId);
        Task<bool> DeletePhoto(Guid userId, Guid photoId);
        Task<UserDto> GetUserAuthenticatedInfos(ClaimsPrincipal userPrincipal);
        Task<bool> MarkProfileAsViewedAsync(Guid profileId);
        Task<bool> LikeUserAsync(Guid userIdToLike);
        Task<bool> UnLikeUserAsync(Guid userIdToUnLike);
        Task<bool> BlockUserAsync(Guid userIdToLike);
        Task<bool> UnblockUserAsync(Guid userIdToUnblock);
        Task<IEnumerable<UserProfileLikedDto>> GetWhoLikedMeAsync(Guid UserId);
        Task<IEnumerable<UserProfileLikedDto>> GetLikesGivenAsync(Guid userId);
        Task<IEnumerable<UserDto>> GetWhoViewedMeAsync(Guid userId);
        Task<(bool IsLikedByMe, bool IsLikedByThem, bool IsMatched)> GetLikeStatusAsync(Guid targetUserId);
    }
}
