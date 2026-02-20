using AutoMapper;
using matcha.Application.Dtos.Users;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Specifications;
using matcha.Domain.Common.Enums;
using matcha.Domain.Entities;

namespace matcha.DomainServices.Services.UserService
{
    public class UserSearchServiceAsync : IUserSearchServiceAsync
    {
        private readonly IUserRepositoryAsync _userRepositoryAsync;
        private readonly IMapper _mapper;
        public UserSearchServiceAsync(IUserRepositoryAsync userRepositoryAsync, IMapper mapper)
        {
            _userRepositoryAsync = userRepositoryAsync;
            _mapper = mapper;
        }

        public async Task<IEnumerable<BrowseUserDto>> SearchUsersAsync(Guid userId, SearchUsersSpecification searchSpec)
        {
            var currentUser = await _userRepositoryAsync.GetUserWithInterestsByIdAsync(userId);

            if (currentUser == null)
                throw new ArgumentException("User not found", nameof(userId));

            searchSpec.ExcludeUserId = currentUser.Id;
            if (!searchSpec.PreferredGenders.Any())
            {
                searchSpec.PreferredGenders = DeterminePreferredGenders(currentUser);
            }

            searchSpec.UserLatitude = currentUser.Latitude;
            searchSpec.UserLongitude = currentUser.Longitude;

            var results = await _userRepositoryAsync.SearchUsersAsync(searchSpec);

            return results;
        }

        private List<Gender> DeterminePreferredGenders(AppUser user)
        {
            if (user.PreferredGender == SexualPreferences.None ||
                user.PreferredGender == SexualPreferences.Unknonw)
            {
                return new List<Gender> { Gender.Male, Gender.Female };
            }

            return user.PreferredGender switch
            {
                SexualPreferences.Male => new List<Gender> { Gender.Male },
                SexualPreferences.Female => new List<Gender> { Gender.Female },
                _ => new List<Gender> { Gender.Male, Gender.Female }
            };
        }

        private void CalculateMatchScores(
            IEnumerable<BrowseUserDto> users,
            AppUser currentUser)
        {
            // Same as MatchmakingService - consider extracting
            var currentUserInterests = currentUser.Interests?
                .Select(i => i.InterestId)
                .ToHashSet() ?? new HashSet<Guid>();

            foreach (var user in users)
            {
                user.CommonTagsCount = user.InterestIds?
                    .Intersect(currentUserInterests)
                    .Count() ?? 0;
            }
        }
    }
}
