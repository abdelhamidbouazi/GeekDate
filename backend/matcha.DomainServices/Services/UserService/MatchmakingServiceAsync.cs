using AutoMapper;
using matcha.Application.Dtos.Users;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Specifications;
using matcha.Domain.Common.Enums;
using matcha.Domain.Entities;

namespace matcha.DomainServices.Services.UserService
{
    public class MatchmakingServiceAsync : IMatchmakingServiceAsync
    {
        private readonly IUserRepositoryAsync _userRepositoryAsync;
        private readonly IMapper _mapper;

        private const int MIN_DESIRED_RESULTS = 10;

        public MatchmakingServiceAsync(IUserRepositoryAsync userRepositoryAsync, IMapper mapper)
        {
            _userRepositoryAsync = userRepositoryAsync;
            _mapper = mapper;
        }

        public async Task<IEnumerable<BrowseUserDto>> BrowseUsersAsync(Guid userId)
        {
            var currentUser = await _userRepositoryAsync.GetUserWithInterestsByIdAsync(userId);

            if (currentUser == null)
                throw new ArgumentException("User not found", nameof(userId));

            var results = await GetResultsWithRelaxation(currentUser);

            CalculateMatchScores(results, currentUser);

            return results;
        }

        private async Task<List<BrowseUserDto>> GetResultsWithRelaxation(AppUser currentUser)
        {
            var userAge = CalculateUserAge(currentUser);

            // Search levels with increasing distance
            var searchLevels = new[]
            {
                (Distance: 10_000.0,   UseInterests: true),   // 10km with interests
                (Distance: 50_000.0,   UseInterests: true),   // 50km with interests
                (Distance: 100_000.0,  UseInterests: false),  // 100km no interests
                (Distance: 500_000.0,  UseInterests: false),  // 500km no interests
                (Distance: 2_000_000.0, UseInterests: false)  // 2000km no interests
            };

            var uniqueIds = new HashSet<Guid>();
            var allResults = new List<BrowseUserDto>();

            foreach (var level in searchLevels)
            {
                var spec = new BrowseUsersSpecification
                {
                    ExcludeUserId = currentUser.Id,
                    PreferredGenders = DeterminePreferredGenders(currentUser),
                    UserLatitude = currentUser.Latitude,
                    UserLongitude = currentUser.Longitude,
                    MaxDistanceMeters = level.Distance,

                    UserInterestIds = level.UseInterests
                        ? currentUser.Interests?.Select(i => i.InterestId).ToList() ?? new List<Guid>()
                        : new List<Guid>(),

                    MinAge = 18,
                    MaxAge = userAge + 10,
                    MinFameRating = Math.Max(0, currentUser.FameRating - 20),
                    MaxFameRating = currentUser.FameRating + 30
                };

                var results = await _userRepositoryAsync.GetMatchingUsersAsync(spec);

                foreach (var user in results)
                {
                    if (uniqueIds.Add(user.Id))
                    {
                        allResults.Add(user);
                    }
                }

                if (allResults.Count >= MIN_DESIRED_RESULTS)
                    break;
            }

            return allResults;
        }

        private List<Gender> DeterminePreferredGenders(AppUser user)
        {
            if (user.PreferredGender == SexualPreferences.None ||
                user.PreferredGender == SexualPreferences.Unknown)
            {
                return new List<Gender> { Gender.Male, Gender.Female };
            }

            return user.PreferredGender switch
            {
                SexualPreferences.Male => new List<Gender> { Gender.Male },
                SexualPreferences.Female => new List<Gender> { Gender.Female },
                SexualPreferences.Unknown => new List<Gender> { Gender.Male, Gender.Female },
                _ => new List<Gender> { Gender.Male, Gender.Female }
            };
        }

        private void CalculateMatchScores(
            IEnumerable<BrowseUserDto> users,
            AppUser currentUser)
        {
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

        private int CalculateUserAge(AppUser user)
        {
            if (!user.DateOfBirth.HasValue) return 30;

            var age = DateTime.UtcNow.Year - user.DateOfBirth.Value.Year;
            if (user.DateOfBirth.Value.Date > DateTime.UtcNow.AddYears(-age))
                age--;

            return age;
        }
    }
}
