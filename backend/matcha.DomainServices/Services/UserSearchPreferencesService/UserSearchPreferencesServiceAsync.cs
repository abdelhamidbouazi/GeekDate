using AutoMapper;
using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.Interfaces.UoW;
using sparkdates.Domain.Entities;

namespace sparkdates.DomainServices.Services.UserSearchPreferencesService
{
    public class UserSearchPreferencesServiceAsync : IUserSearchPreferencesServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserSearchPreferenceRepositoryAsync _userSearchPreferencesRepositoryAsync;
        private readonly IMapper _mapper;
        private readonly IAuthenticatedUser _authenticatedUser;

        public UserSearchPreferencesServiceAsync(IUnitOfWork unitOfWork, IMapper mapper, IUserSearchPreferenceRepositoryAsync userSearchPreferenceRepositoryAsync)
        {
            _userSearchPreferencesRepositoryAsync = userSearchPreferenceRepositoryAsync;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<SearchPreferencesDto> GetByUserIdAsync(Guid userId)
        {
            var existingPreference = await _userSearchPreferencesRepositoryAsync.GetByUserIdAsync(userId);
            if (existingPreference == null)
            {
                // Create default preferences if none exist
                await _userSearchPreferencesRepositoryAsync.CreateDefaultUserPreferencesAsync(userId);
                existingPreference = await _userSearchPreferencesRepositoryAsync.GetByUserIdAsync(userId);
                if (existingPreference == null)
                    throw new ArgumentException("Failed to create default preferences", nameof(userId));
            }

            return _mapper.Map<SearchPreferencesDto>(existingPreference);
        }
        public async Task<bool> DeleteByUserIdAsync(Guid userId)
        {
            var existingPreference = await GetByUserIdAsync(userId);

            var mapper = _mapper.Map<UserSearchPreference>(existingPreference);

            var result = await _unitOfWork.GetRepository<IUserSearchPreferenceRepositoryAsync>().Delete(mapper);

            return result > 0;
        }

        public async Task UpdateAsync(Guid userId, UserSearchPreference userPreference)
        {
            var existingPreference = await GetByUserIdAsync(userId);

            existingPreference.MinAge = userPreference.MinAge;
            existingPreference.MaxAge = userPreference.MaxAge;
            existingPreference.MaxDistanceKm = userPreference.MaxDistanceKm;
            existingPreference.MinFameRating = userPreference.MinFameRating;
            existingPreference.MaxFameRating = userPreference.MaxFameRating;
            existingPreference.IsFirstTime = false;

            var mapper = _mapper.Map<UserSearchPreference>(existingPreference);

            await _unitOfWork.GetRepository<IUserSearchPreferenceRepositoryAsync>().Update(mapper);
        }
    }
}
