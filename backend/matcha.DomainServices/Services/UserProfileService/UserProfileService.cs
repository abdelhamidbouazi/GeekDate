using AutoMapper;
using sparkdates.Application.Dtos.Profile;
using sparkdates.Application.Dtos.UserBlocks;
using sparkdates.Application.Dtos.UserLikes;
using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Exceptions;
using sparkdates.Application.Features.Profile.Commands.CompleteUserPreferences;
using sparkdates.Application.Features.Profile.Commands.UpdateUserProfile;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.Interfaces.Services.Email;
using sparkdates.Application.Interfaces.UoW;
using sparkdates.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;


namespace sparkdates.DomainServices.Services.UserService
{
    public class UserProfileService : IUserProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailService _mailService;
        private readonly IUserServiceAsync _userServiceAsync;
        private readonly IConfiguration _configuration;
        private readonly IAuthenticatedUser _authenticatedUser;

        public UserProfileService(IUnitOfWork unitOfWork, IMapper mapper, IEmailService mailService, IUserServiceAsync userServiceAsync, IConfiguration configuration,
            IAuthenticatedUser authenticatedUser)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _mailService = mailService;
            _userServiceAsync = userServiceAsync;
            _configuration = configuration;
            _authenticatedUser = authenticatedUser;
        }

        private async Task<AppUser> GetUserAsync(Guid userId)
        {
            try
            {
                var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FindAsync(userId);

                if (user == null)
                    throw new NotFoundException($"User with ID {userId} not found.");

                return user;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}\nStack Trace: {ex.StackTrace}");
                throw;
            }
        }

        private async Task<IEnumerable<UserInterest>> CreateUserInterestsAndSaveAsync(Guid userId, List<Guid> interests)
        {
            var newUserInterestsList = new List<UserInterest>();

            if (interests == null || !interests.Any())
                throw new ValidationException("Error");

            for (int i = 0; i < interests.Count; i++)
            {
                var userInterest = new UserInterest
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    InterestId = interests[i],
                };

                newUserInterestsList.Add(userInterest);
            }

            await _unitOfWork.GetRepository<IUserInterestsRepositoyAsync>().AddRangeAsync(newUserInterestsList);
            return newUserInterestsList;
        }

        private async Task<List<ImageDto>> UploadUserImagesAsync(IEnumerable<IFormFile> userPictures, Guid userId)
        {
            List<ImageDto> listImages = new List<ImageDto>();

            //if (userPictures.Any(x => x.IsMain))
            //    listImages.Add(await _userServiceAsync.UploadImage(userId, userPictures.First(x => x.IsMain), true));

            await Parallel.ForEachAsync(userPictures, async (photo, cancellationToken) =>
            {
                var imageDto = await _userServiceAsync.UploadImage(userId, photo, false);
                listImages.Add(imageDto);
            });

            return listImages;
        }

        private async Task AssociatePhotosWithUserAsync(List<ImageDto> listImages, AppUser user)
        {
            foreach (var imageDto in listImages)
            {
                var photo = new Photo
                {
                    Id = imageDto.Id,
                    Url = imageDto.Url,
                    PublicId = imageDto.PublicId,
                    IsMain = imageDto.IsMain,
                    UserId = user.Id,
                    User = user
                };

                var existingPhoto = await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().FindAsync(photo.Id);
                if (existingPhoto != null)
                {
                    //_unitOfWork.GetRepository<IPhotoRepositoryAsync>().Detach(existingPhoto);
                }

                user.Photos ??= new List<Photo>();
                user.Photos.Add(photo);
            }
        }

        private async Task<PreferencesAndInterestsDto> UpdateUserPreferences(CompleteUserPreferencesCommand preferencesDto)
        {
            return new PreferencesAndInterestsDto
            {
                Biography = preferencesDto.Biography,
                PreferredGender = preferencesDto.PreferredGender,
                UserInterestIds = preferencesDto.UserInterestIds,
            };
        }

        public async Task<UserProfileDto> CompleteUserPreferencesAsync(CompleteUserPreferencesCommand userPreferencesDto)
        {
            try
            {
                await _unitOfWork.CreateTransaction();

                var user = await GetUserAsync(_authenticatedUser.UserId);
                if (user is null) throw new NotFoundException("user is not exist");

                var interests = await CreateUserInterestsAndSaveAsync(_authenticatedUser.UserId, userPreferencesDto.UserInterestIds);

                var preferences = await UpdateUserPreferences(userPreferencesDto);

                user.IsPreferencesComplete = true;
                user.IsBasicInfoComplete = true;
                user.IsProfileCompleted = user.IsBasicInfoComplete && user.IsPreferencesComplete;

                await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(_mapper.Map(preferences, user));
                if (userPreferencesDto.Pictures is not null && userPreferencesDto.Pictures.Any())
                    await UploadUserImagesAsync(userPreferencesDto.Pictures, _authenticatedUser.UserId);

                await _unitOfWork.CompleteAsync();

                if (user.IsProfileCompleted)
                    user.HasLoggedIn = true;

                await _unitOfWork.CommitTransaction();

                return _mapper.Map<UserProfileDto>(user);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollBackTransaction();
                throw new ApiException($"Failed to complete user profile: {ex.Message}");
            }
        }

        // CompleteBasicUserProfileAsync
        //public async Task<UserProfileDto> CompleteBasicUserProfileAsync(BasicUserProfileDto basicUserProfileDto)
        //{
        //    var user = await GetUserAsync(_authenticatedUser.UserId);
        //    List<ImageDto> listImages = new List<ImageDto>();

        //    try
        //    {
        //        _mapper.Map(basicUserProfileDto, user);

        //        // Upload images first, outside of main transaction
        //        //listImages = await UploadUserImagesAsync(basicUserProfileDto., user.Id);

        //        // Start transaction for database operations
        //        await _unitOfWork.CreateTransaction();

        //        // Add photos to user
        //        await AssociatePhotosWithUserAsync(listImages, user);

        //        user.IsBasicInfoComplete = true;

        //        await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);

        //        await _unitOfWork.CompleteAsync();

        //        await _unitOfWork.GetRepository<IUserSearchPreferenceRepositoryAsync>().CreateDefaultUserPreferencesAsync(user.Id);

        //        // Commit transaction
        //        await _unitOfWork.CommitTransaction();

        //        return _mapper.Map<UserProfileDto>(user);
        //    }
        //    catch (Exception ex)
        //    {
        //        // Rollback database changes if transaction was started
        //        await _unitOfWork.RollBackTransaction();

        //        // Clean up uploaded images
        //        foreach (var image in listImages)
        //        {
        //            await _userServiceAsync.DeletePhoto(_authenticatedUser.UserId, image.Id);
        //        }

        //        throw new ApiException($"Failed to complete user profile: {ex.Message}");
        //    }
        //}


        public async Task<UserProfileDto> CompleteBasicUserProfileAsync(BasicUserProfileDto basicUserProfileDto)
        {
            var user = await GetUserAsync(_authenticatedUser.UserId);
            List<ImageDto> listImages = new List<ImageDto>();

            try
            {
                // ✅ MAPPING MANUEL (évite AutoMapper avec IFormFile)
                user.Gender = basicUserProfileDto.Gender;
                user.DateOfBirth = basicUserProfileDto.DateOfBirth;

                Console.WriteLine($"✅ Manual mapping: Gender={user.Gender}, DOB={user.DateOfBirth}");

                // ✅ Créer transaction
                await _unitOfWork.CreateTransaction();

                // ✅ Upload MainPicture
                if (basicUserProfileDto.MainPicture != null)
                {
                    Console.WriteLine("📸 Uploading main picture...");
                    var mainPhotoDto = await _userServiceAsync.UploadImage(
                        user.Id,
                        basicUserProfileDto.MainPicture,
                        isMain: true
                    );
                    listImages.Add(mainPhotoDto);
                    user.PhotoProfileUrl = mainPhotoDto.Url;
                    Console.WriteLine($"✅ Main picture uploaded: {mainPhotoDto.Url}");
                }

                // ✅ Upload Photos additionnelles
                if (basicUserProfileDto.Photos != null && basicUserProfileDto.Photos.Any())
                {
                    Console.WriteLine($"📸 Uploading {basicUserProfileDto.Photos.Count} photos...");
                    foreach (var photoFile in basicUserProfileDto.Photos)
                    {
                        var photoDto = await _userServiceAsync.UploadImage(
                            user.Id,
                            photoFile,
                            isMain: false
                        );
                        listImages.Add(photoDto);
                        Console.WriteLine($"✅ Photo uploaded: {photoDto.Url}");
                    }
                }

                // ✅ Update user
                user.IsBasicInfoComplete = true;
                await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);
                await _unitOfWork.CompleteAsync();

                // ✅ Créer préférences par défaut
                await _unitOfWork.GetRepository<IUserSearchPreferenceRepositoryAsync>()
                    .CreateDefaultUserPreferencesAsync(user.Id);

                // ✅ Commit
                await _unitOfWork.CommitTransaction();

                Console.WriteLine($"✅ Profile completed for user {user.Id}");

                return _mapper.Map<UserProfileDto>(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");

                // ✅ Rollback
                await _unitOfWork.RollBackTransaction();

                // ✅ Nettoyer Cloudinary
                foreach (var image in listImages)
                {
                    try
                    {
                        await _userServiceAsync.DeletePhoto(_authenticatedUser.UserId, image.Id);
                    }
                    catch (Exception cleanupEx)
                    {
                        Console.WriteLine($"⚠️ Cleanup failed for {image.Id}: {cleanupEx.Message}");
                    }
                }

                throw new ApiException($"Failed to complete user profile: {ex.Message}");
            }
        }
        public async Task<bool> DeleteUser(Guid id)
        {
            var userProfile = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FindAsync(id);

            if (userProfile == null)
                throw new NotFoundException();

            await _unitOfWork.GetRepository<IUserRepositoryAsync>().Delete(userProfile);

            return await _unitOfWork.CompleteAsync();
        }

        public async Task<IReadOnlyCollection<GetAllUserProfilesDto>> GetAllAsync()
        {
            return _mapper.Map<IReadOnlyCollection<GetAllUserProfilesDto>>
                (await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetAllAsync());
        }

        public async Task<GetUserProfileByIdDto> GetByIdAsync(Guid id)
        {
            var userProfile = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FindAsync(id);

            if (userProfile == null)
                throw new NotFoundException();

            return _mapper.Map<GetUserProfileByIdDto>(userProfile);
        }

        public async Task<bool> UpdateUserProfileAsync(UpdateUserProfileCommand profileCommand, Guid userId)
        {
            var userProfile = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FindAsync(userId);

            if (userProfile == null)
                throw new NotFoundException("User Does Not Found.");

            try
            {
                await _unitOfWork.CreateTransaction();

                var userInterests = await _unitOfWork.GetRepository<IUserInterestsRepositoyAsync>().GetAllAsync(interest => interest.UserId == userId);

                await _unitOfWork.GetRepository<IUserInterestsRepositoyAsync>().DeleteRange(userInterests);

                var createdUserInterests = await CreateUserInterestsAndSaveAsync(userProfile.Id, profileCommand.UserInterestIds);

                // Manual mapping to avoid AutoMapper issues with complex entity
                userProfile.FirstName = profileCommand.FirstName;
                userProfile.LastName = profileCommand.LastName;
                userProfile.Email = profileCommand.Email;
                userProfile.Gender = profileCommand.Gender;
                userProfile.Biography = profileCommand.Biography;
                userProfile.PreferredGender = profileCommand.SexualPreferences;
                userProfile.City = profileCommand.City;

                await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(userProfile);

                await _unitOfWork.CommitTransaction();

                return true;
            }

            catch (ValidationException)
            {
                await _unitOfWork.RollBackTransaction();
                throw;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollBackTransaction();
                throw new ApiException("An error occured while updating profile", ex);
            }
        }

        public async Task<UserProfileDto> GetUserProfile(Guid id)
        {
            return _mapper.Map<UserProfileDto>(await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetUserProfile(id));
        }

        public async Task<GetUserLikesDto> GetUserLikesAsync(Guid userId)
        {
            var user = await GetUserAsync(userId);

            var userLikes = _unitOfWork.GetRepository<IUserLikesRepositoryAsync>().GetAllAsync();

            throw new NotImplementedException();
        }

        public async Task<GetUsersBlocksDto> GetUserBlocksAsync(Guid userId)
        {
            var blockedUserRows = await _unitOfWork.GetRepository<IGenericRepoAsync<UserBlock>>()
                .GetAllAsync(block => block.BlockingUserId == userId);

            var blockedUsers = new List<GetUserBlocksDto>();

            foreach (var block in blockedUserRows)
            {
                var blockedUser = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FindAsync(block.BlockedUserId);
                if (blockedUser is null)
                    continue;

                blockedUsers.Add(new GetUserBlocksDto
                {
                    BlockedUserId = block.BlockedUserId,
                    BlockingUserId = block.BlockingUserId,
                    FirstName = blockedUser.FirstName,
                    LastName = blockedUser.LastName,
                    UserName = blockedUser.UserName,
                    ProfilePicture = blockedUser.PhotoProfileUrl
                });
            }

            return new GetUsersBlocksDto
            {
                UserBlocks = blockedUsers
            };
        }

        public async Task<bool> SetProfilePictureAsync(Guid userId, Guid pictureId)
        {
            var photo = await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().FindAsync(pictureId);
            if (photo is null) throw new NotFoundException("The photo with the given Id does not exist");

            var photos = await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().GetAllAsync(p => p.UserId == userId);
            if (photos is null || !photos.Any())
                throw new NotFoundException("No photos found for the user.");

            foreach (var picture in photos)
            {
                picture.IsMain = false;
                if (picture.Id == pictureId)
                    picture.IsMain = true;
            }

            await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().UpdateRange(photos);
            return true;
        }

        public async Task<bool> DeletePhotoAsync(Guid userId, Guid photoId)
        {
            var photo = await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().FindAsync(photoId);
            if (photo is null) throw new NotFoundException("The photo with the given Id does not exist");

            var result = await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().Delete(photo);

            return result > 0;
        }

        public async Task<bool> UploadPhotosAsync(List<IFormFile> photos, Guid userId)
        {
            var userPhotos = await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().GetAllAsync(p => p.UserId == userId);

            if (userPhotos.Count + photos.Count > 5)
                throw new ValidationException("Validation errors occurs", new() { { "Pictures", "You can only upload a maximum of 5 photos. Please remove some photos before uploading new ones." } });

            var listImages = await UploadUserImagesAsync(photos, userId);

            return true;
        }
        public async Task<IEnumerable<Photo>> GetUserPhotosAsync(Guid userId)
        {
            return await _unitOfWork.GetRepository<IPhotoRepositoryAsync>().GetAllAsync(p => p.UserId == userId);
        }

        public async Task<bool> SetUserLocationAsync(Guid userId, double latitude, double longitude)
        {
            var user = await _userServiceAsync.GetUserByIdAsync(userId);
            if (user == null)
                throw new NotFoundException($"User with ID {userId} not found.");

            user.Latitude = latitude;
            user.Longitude = longitude;

            var result = await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);
            return result > 0;
        }

        public async Task<ConnectedUserProfileDto> GetConnectedProfileAsync(Guid userId)
        {
            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetUserWithPhotosById(userId);

            if (user == null)
                throw new NotFoundException($"User with ID {userId} not found.");
            var interests = await _unitOfWork.GetRepository<IInterestRepositoryAsync>().GetInterestsWithNamesByUserIdAsync(userId);
            var likes = await _unitOfWork.GetRepository<IUserLikesRepositoryAsync>().GetAllAsync(x => x.LikedUserId == userId);
            var profileViews = await _unitOfWork.GetRepository<IGenericRepoAsync<ProfileView>>().GetAllAsync(x => x.TargetUserId == userId);

            var connectedProfile = _mapper.Map<ConnectedUserProfileDto>(user);
            connectedProfile.UserLikes = likes.Count;
            connectedProfile.ProfileViews = profileViews.Count;
            connectedProfile.Interests = interests;
            return connectedProfile;
        }

        public async Task<IEnumerable<UserProfileViewerDto>> GetWhoViewedMeAsync(Guid userId)
        {
            var profileViews = await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetProfileViewersAsync(userId);

            if (profileViews == null || !profileViews.Any())
                return [];

            var users = profileViews.Select(x => new UserProfileViewerDto
            {
                FirstName = x.FirstName,
                LastName = x.LastName,
                ProfilePicture = x.Photos.Any(p => p.IsMain) ? x.Photos.First(x => x.IsMain).Url : "",
                Id = x.Id,
                Age = x.DateOfBirth.HasValue ? DateTime.Now.Year - x.DateOfBirth.Value.Year : 0,
            });
            return users;
        }

        public async Task<IEnumerable<UserProfileLikedDto>> GetWhoLikedMeAsync(Guid userId)
        {
            var profileViews = await _unitOfWork.GetRepository<IUserRepositoryAsync>().GetprofileLikesAsync(userId);

            if (profileViews == null || !profileViews.Any())
                return [];

            var users = profileViews.Select(x => new UserProfileLikedDto
            {
                FirstName = x.FirstName,
                LastName = x.LastName,
                ProfilePicture = x.Photos.Any(p => p.IsMain) ? x.Photos.First(x => x.IsMain).Url : "",
                Id = x.Id,
                Age = x.DateOfBirth.HasValue ? DateTime.Now.Year - x.DateOfBirth.Value.Year : 0,
            });
            return users;
        }
    }
}
