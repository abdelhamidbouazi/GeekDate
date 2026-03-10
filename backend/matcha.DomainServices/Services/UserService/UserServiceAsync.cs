using matcha.Application.Dtos.PhotoDtos;
using matcha.Application.Dtos.Users;
using matcha.Application.Exceptions;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.Interfaces.Services.Cloudinary;
using matcha.Application.Interfaces.UoW;
using matcha.Domain.Common.Enums;
using matcha.Domain.Entities;
using matcha.Shared.Constants;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace matcha.DomainServices.Services.UserService
{
    public class UserServiceAsync : IUserServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryServiceAsync _cloudinaryServiceAsync;
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IRealtimeNotificationServiceAsync _notificationService;

        public UserServiceAsync(IUnitOfWork unitOfWork, ICloudinaryServiceAsync cloudinaryServiceAsync, IAuthenticatedUser authenticatedUser, IRealtimeNotificationServiceAsync notificationService)
        {
            _unitOfWork = unitOfWork;
            _cloudinaryServiceAsync = cloudinaryServiceAsync;
            _authenticatedUser = authenticatedUser;
            _notificationService = notificationService;
        }

        public async Task<AppUser> GetUserByIdAsync(Guid userId)
        {
            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetUserWithPhotosById(userId);

            if (user == null) throw new NotFoundException("Could not find user");

            return user;
        }

        public async Task<AppUser> GetUserByNameAsync(string userName)
        {
            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FirstOrDefaultAsync(u => u.UserName == userName);

            if (user == null) throw new NotFoundException("Could not find user");

            return user;
        }

        public async Task<IReadOnlyCollection<AppUser>> GetUsersAsync()
        {
            var userRepository = _unitOfWork.GetRepository<IUserRepositoryAsync>();

            return await userRepository.GetAllAsync();
        }

        public async Task<ImageDto> UploadImage(Guid userId, IFormFile file, bool isMain)
        {
            string imagePublicId = "";

            try
            {
                // upload the image to the cloud
                var imageUploadResult = await UploadImageToCloudAsync(file);
                imagePublicId = imageUploadResult.PublicId;

                var photo = CreatePhotoEntity(userId, imageUploadResult, isMain);

                await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().AddAsync(photo);

                // Map the photo entity to imageDto and return it
                return MapPhotoToDto(photo);
            }

            catch (Exception)
            {
                if (!string.IsNullOrEmpty(imagePublicId))
                    await _cloudinaryServiceAsync.DeleteImageAsync(imagePublicId);
                throw;

            }
        }

        private async Task<AppUser> GetUserWithPhotosAsync(Guid userId)
        {
            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetUserWithPhotosById(userId);

            if (user is null)
                throw new NotFoundException("User not found");

            return user;
        }

        private async Task<ImageUploadResultDto> UploadImageToCloudAsync(IFormFile file)
        {
            var imageUploadResult = await _cloudinaryServiceAsync.UploadImageAsync(file);

            if (imageUploadResult.Error != null)
                throw new ApiException(imageUploadResult.Error);

            return imageUploadResult;
        }

        private Photo CreatePhotoEntity(Guid userId, ImageUploadResultDto imageUploadResult, bool isMain)
        {
            return new Photo
            {
                Id = Guid.NewGuid(),
                Url = imageUploadResult.Url.ToString(),
                PublicId = imageUploadResult.PublicId,
                IsMain = isMain,
                UserId = userId
            };
        }

        private async Task AddPhotoToUserAsync(AppUser user, Photo photo)
        {
            if (user.Photos == null)
            {
                user.Photos = new List<Photo>();
            }

            user.Photos.Add(photo);
        }

        private ImageDto MapPhotoToDto(Photo photo)
        {
            return new ImageDto
            {
                Id = photo.Id,
                Url = photo.Url,
                IsMain = photo.IsMain,
                PublicId = photo.PublicId,
            };
        }

        public async Task<bool> SetMainPhoto(Guid photoId, Guid userId)
        {
            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetUserWithPhotosById(userId);

            if (user is null)
                throw new NotFoundException($"User with ID {userId} not found.");

            var photo = await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().FindAsync(photoId);

            if (photo is null)
                throw new NotFoundException("Photo not found. Please choose a valid photo.");

            if (photo.IsMain)
                throw new ApiException("This photo is already set as the main photo. Please select a different photo.");

            var currentMainPhoto = user.Photos.FirstOrDefault(p => p.IsMain);

            if (currentMainPhoto != null) currentMainPhoto.IsMain = false;

            photo.IsMain = true;

            //return await _unitOfWork.GetRepository<IUserRepositoryAsync>().SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePhoto(Guid userId, Guid photoId)
        {
            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetUserWithPhotosById(userId);

            if (user is null)
                throw new NotFoundException("$User with ID {userId} not found.");

            var photo = await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().FindAsync(photoId);

            if (photo is null)
                throw new NotFoundException("Photo does not exist");

            // If the photo has a public ID, delete it from the cloud service
            if (!string.IsNullOrEmpty(photo.PublicId))
            {
                var result = await _cloudinaryServiceAsync.DeleteImageAsync(photo.PublicId);

                //if (result.Message != null)
                //{
                //    throw new ApiException($"An error occurred while deleting the photo from the cloud: {result.Message}");
                //}
            }

            user.Photos.Remove(photo);


            //if (!await _unitOfWork.GetRepository<IUserRepositoryAsync>().SaveChangesAsync())
            //    throw new ApiException("Failed to delete the photo from the database.");

            return true;
        }

        public async Task<UserDto> GetUserAuthenticatedInfos(ClaimsPrincipal userPrincipal)
        {
            var user = await _authenticatedUser.GetAuthenticatedAsync();

            return new UserDto
            {
                UserName = user.UserName,
                PictureUrl = user.Photos
                    .Where(p => p.IsMain)
                    .Select(p => p.Url)
                    .FirstOrDefault()
            };
        }

        public async Task<bool> MarkProfileAsViewedAsync(Guid profileId)
        {
            try
            {
                await _unitOfWork.CreateTransaction();
                var _repos = _unitOfWork.GetRepository<IGenericRepoAsync<ProfileView>>();
                var profileView = await _repos.FirstOrDefaultAsync(x => x.FromUserId == _authenticatedUser.UserId && x.TargetUserId == profileId);
                if (profileView is null)
                {
                    profileView = new ProfileView
                    {
                        Id = Guid.NewGuid(),
                        FromUserId = _authenticatedUser.UserId,
                        TargetUserId = profileId,
                        ViewedAt = DateTime.UtcNow
                    };
                    var user = await GetUserByIdAsync(profileId);
                    user.FameRating += FameRatingConstants.ProfileViewedRating;
                    await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);
                    await _repos.AddAsync(profileView);
                }
                else
                {
                    profileView.ViewedAt = DateTime.UtcNow;
                    await _repos.Update(profileView);
                }

                await _unitOfWork.CommitTransaction();

                await _notificationService.SendNotificationAsync(
                    profileId, _authenticatedUser.UserId, NotificationType.ProfileVisit);

                return true;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollBackTransaction();
                throw new ApiException("Failed to mark profile as viewed", ex);
            }

        }
        //public async Task<bool> LikeUserAsync(Guid userIdToLike)
        //{
        //    try
        //    {
        //        await _unitOfWork.CreateTransaction();
        //        var _repos = _unitOfWork.GetRepository<IGenericRepoAsync<UserLike>>();
        //        var userLike = await _repos.FirstOrDefaultAsync(x => (x.LikerUserId == _authenticatedUser.UserId && x.LikedUserId == userIdToLike) || (x.LikerUserId == userIdToLike && x.LikedUserId == _authenticatedUser.UserId));

        //        if (userLike is null)
        //        {
        //            userLike = new UserLike
        //            {
        //                Id = Guid.NewGuid(),
        //                LikerUserId = _authenticatedUser.UserId,
        //                LikedUserId = userIdToLike,
        //                LikedAt = DateTime.UtcNow
        //            };
        //            var user = await GetUserByIdAsync(userIdToLike);
        //            user.FameRating += FameRatingConstants.LikeRating;
        //            await _repos.AddAsync(userLike);
        //            await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);
        //        }
        //        else
        //        {
        //            if (userLike.LikerUserId == userIdToLike && _authenticatedUser.UserId == userLike.LikedUserId && !userLike.IsMatched)
        //            {
        //                var user = await GetUserByIdAsync(userIdToLike);
        //                user.FameRating += FameRatingConstants.MatchRating;
        //                await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);
        //                userLike.IsMatched = true;
        //                userLike.MatchedAt = DateTime.UtcNow;
        //                await _repos.Update(userLike);
        //            }
        //        }
        //        await _unitOfWork.CommitTransaction();
        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        await _unitOfWork.RollBackTransaction();
        //        throw new ApiException("Failed to like the user", ex);
        //    }

        //}

        public async Task<bool> LikeUserAsync(Guid targetUserId)
        {
            await _unitOfWork.CreateTransaction();

            try
            {
                var currentUserId = _authenticatedUser.UserId;

                var repo = _unitOfWork.GetRepository<IGenericRepoAsync<UserLike>>();

                var like = await repo.FirstOrDefaultAsync(l =>
                    (l.LikerUserId == currentUserId && l.LikedUserId == targetUserId) ||
                    (l.LikerUserId == targetUserId && l.LikedUserId == currentUserId));

                if (like == null)
                {
                    await CreateLikeAsync(repo, currentUserId, targetUserId);
                }
                else
                {
                    await TryCreateMatchAsync(repo, like, currentUserId, targetUserId);
                }

                await _unitOfWork.CommitTransaction();
                return true;
            }
            catch
            {
                await _unitOfWork.RollBackTransaction();
                throw;
            }
        }

        public async Task CreateLikeAsync(IGenericRepoAsync<UserLike> repo, Guid likerId, Guid likedId)
        {
            var like = new UserLike
            {
                Id = Guid.NewGuid(),
                LikerUserId = likerId,
                LikedUserId = likedId,
                LikedAt = DateTime.UtcNow
            };

            var user = await GetUserByIdAsync(likedId);
            user.FameRating += FameRatingConstants.LikeRating;

            await repo.AddAsync(like);
            await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);

            await _notificationService.SendNotificationAsync(likedId, likerId, NotificationType.Like);
        }

        private async Task TryCreateMatchAsync(IGenericRepoAsync<UserLike> repo, UserLike like, Guid currentUserId, Guid targetUserId)
        {
            if (like.LikerUserId != targetUserId || like.LikedUserId != currentUserId)
                return;

            if (like.IsMatched)
                return;

            like.IsMatched = true;
            like.MatchedAt = DateTime.UtcNow;

            var user = await GetUserByIdAsync(targetUserId);
            user.FameRating += FameRatingConstants.MatchRating;

            await repo.Update(like);
            await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);

            var matchRepo = _unitOfWork.GetRepository<IMatchRepositoryAsync>();
            await matchRepo.AddAsync(new Match
            {
                Id = Guid.NewGuid(),
                User1Id = currentUserId,
                User2Id = targetUserId,
                MatchedAt = DateTime.UtcNow
            });

            // Notify both users of the match
            await _notificationService.SendNotificationAsync(targetUserId, currentUserId, NotificationType.Match);
            await _notificationService.SendNotificationAsync(currentUserId, targetUserId, NotificationType.Match);
            //if ((like.LikerUserId == targetUserId && like.LikedUserId == currentUserId)
            //   || (like.LikerUserId == currentUserId && like.LikedUserId == targetUserId))
            //{
            //    if (!like.IsMatched)
            //    {
            //        like.IsMatched = true;
            //        like.MatchedAt = DateTime.UtcNow;

            //        var user = await GetUserByIdAsync(targetUserId);
            //        user.FameRating += FameRatingConstants.MatchRating;
            //        await repo.Update(like);
            //        await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);

            //        // Create Match entity
            //        var matchRepo = _unitOfWork.GetRepository<IMatchRepositoryAsync>();
            //        await matchRepo.AddAsync(new Match
            //        {
            //            User1Id = currentUserId,
            //            User2Id = targetUserId,
            //            MatchedAt = DateTime.UtcNow
            //        });

            //        // Notifications / conversation / SignalR here
            //    }
            //}
        }


        public async Task<bool> BlockUserAsync(Guid userIdToLike)
        {
            try
            {
                await _unitOfWork.CreateTransaction();

                var userLike = await _unitOfWork.GetRepository<IGenericRepoAsync<UserLike>>()
                    .FirstOrDefaultAsync(x => (x.LikerUserId == _authenticatedUser.UserId && x.LikedUserId == userIdToLike) || (x.LikerUserId == userIdToLike && x.LikedUserId == _authenticatedUser.UserId));
                if (userLike is not null)
                    await _unitOfWork.GetRepository<IGenericRepoAsync<UserLike>>().Delete(userLike);

                var profileViews = await _unitOfWork.GetRepository<IGenericRepoAsync<ProfileView>>()
                    .GetAllAsync(x => (x.FromUserId == _authenticatedUser.UserId && x.TargetUserId == userIdToLike) || (x.TargetUserId == _authenticatedUser.UserId && x.FromUserId == userIdToLike));
                if (profileViews.Any())
                    await _unitOfWork.GetRepository<IGenericRepoAsync<ProfileView>>().DeleteRange(profileViews);

                var block = new UserBlock
                {
                    Id = Guid.NewGuid(),
                    BlockingUserId = _authenticatedUser.UserId,
                    BlockedUserId = userIdToLike,
                };

                await _unitOfWork.GetRepository<IGenericRepoAsync<UserBlock>>().AddAsync(block);
                await _unitOfWork.CommitTransaction();
                return true;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollBackTransaction();
                throw new ApiException("Failed to block the requested user", ex);
            }
        }

        // Todo if we enter an id of a user that we didn t like nothing happens
        public async Task<bool> UnLikeUserAsync(Guid userIdToUnLike)
        {
            var _repos = _unitOfWork.GetRepository<IGenericRepoAsync<UserLike>>();
            var userLike = await _repos.FirstOrDefaultAsync(x => (x.LikerUserId == _authenticatedUser.UserId && x.LikedUserId == userIdToUnLike)
            || (x.LikerUserId == userIdToUnLike && x.LikedUserId == _authenticatedUser.UserId));

            if (userLike is null)
                return false;

            await _unitOfWork.CreateTransaction();

            try
            {
                if (userLike.LikerUserId == userIdToUnLike)
                {
                    await _unitOfWork.CreateTransaction();
                    userLike.IsMatched = false;
                    userLike.MatchedAt = null;
                    await _repos.Update(userLike);

                    // delete the corresponding match if exists
                    await RemoveMatchAsync(_authenticatedUser.UserId, userIdToUnLike);

                    await _unitOfWork.CommitTransaction();
                }
                else
                {
                    await _repos.Delete(userLike);
                    await RemoveMatchAsync(_authenticatedUser.UserId, userIdToUnLike);

                    await _unitOfWork.CommitTransaction();
                }
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollBackTransaction();
                throw;
            }

            return true;
        }

        private async Task RemoveMatchAsync(Guid user1Id, Guid user2Id)
        {
            var matchRepo = _unitOfWork.GetRepository<IMatchRepositoryAsync>();
            var match = await matchRepo.FirstOrDefaultAsync(m =>
                (m.User1Id == user1Id && m.User2Id == user2Id) ||
                (m.User1Id == user2Id && m.User2Id == user1Id));

            if (match != null)
                await matchRepo.Delete(match);
        }

        //public async Task<IEnumerable<BrowseUserDto>> BrowseUsersAsync()
        //{
        //    if (!_authenticatedUser.Authenticated) throw new UnauthorizedException("User is not authenticated");

        //    var userId = _authenticatedUser.UserId;

        //    return await _unitOfWork.GetRepository<IUserRepositoryAsync>().BrowseUsersAsync(userId);
        //}

        public async Task<IEnumerable<UserDto>> GetWhoViewedMeAsync(Guid userId)
        {
            var views = await _unitOfWork.GetRepository<IGenericRepoAsync<ProfileView>>()
                .GetAllAsync(x => x.TargetUserId == userId);

            var result = new List<UserDto>();

            foreach (var view in views.OrderByDescending(v => v.ViewedAt))
            {
                var user = await GetUserByIdAsync(view.FromUserId);

                result.Add(new UserDto
                {
                    UserName = user.UserName,
                    PictureUrl = user.Photos
                        .Where(p => p.IsMain)
                        .Select(p => p.Url)
                        .FirstOrDefault()
                });

            }
            return result;
        }

        public async Task<IEnumerable<UserDto>> GetWhoLikedMeAsync(Guid UserId)
        {
            var likes = await _unitOfWork.GetRepository<IGenericRepoAsync<UserLike>>()
                .GetAllAsync(x => x.LikedUserId == UserId || (x.LikerUserId == UserId && x.IsMatched == true));

            var result = new List<UserDto>();

            foreach (var like in likes.OrderByDescending(l => l.LikedAt))
            {
                var likeOwnerId = _authenticatedUser.UserId == like.LikerUserId && like.IsMatched ? like.LikedUserId : like.LikerUserId;
                var user = await GetUserByIdAsync(likeOwnerId);
                result.Add(new UserDto
                {
                    UserName = user.UserName,
                    PictureUrl = user.Photos
                        .Where(p => p.IsMain)
                        .Select(p => p.Url)
                        .FirstOrDefault()
                });
            }
            return result;
        }

    }
}
