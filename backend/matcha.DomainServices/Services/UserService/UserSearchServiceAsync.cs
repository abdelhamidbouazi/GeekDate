using AutoMapper;
using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Specifications;
using sparkdates.Domain.Common.Enums;
using sparkdates.Domain.Entities;

namespace sparkdates.DomainServices.Services.UserService
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
            if (searchSpec.PreferredGenders == null || !searchSpec.PreferredGenders.Any())
            {
                searchSpec.PreferredGenders = DeterminePreferredGenders(currentUser);
            }

            searchSpec.UserLatitude = currentUser.Latitude;
            searchSpec.UserLongitude = currentUser.Longitude;

            var results = await _userRepositoryAsync.SearchUsersAsync(searchSpec);

            // FALLBACK: If no users found within the requested distance, ignore distance and search globally
            if (!results.Any())
            {
                searchSpec.MaxDistanceMeters = 20_000_000; // 20,000 km (Global)
                results = await _userRepositoryAsync.SearchUsersAsync(searchSpec);
            }

            // If the user didn't specify a specific sort order (like Age or Distance),
            // or if they want "Recommended", apply k-NN ranking
            var currentUserInterests = currentUser.Interests?
                .Select(i => i.InterestId)
                .ToHashSet() ?? new HashSet<Guid>();

            // If we are sorting by CommonTags or nothing specific, use k-NN to make it smarter
            if (searchSpec.SortBy == SearchSortBy.CommonTags || searchSpec.SortBy == 0)
            {
                return results
                    .Select(r => new { User = r, Score = CalculateKnnDistance(currentUser, currentUserInterests, r) })
                    .OrderBy(x => x.Score)
                    .Select(x =>
                    {
                        x.User.CommonTagsCount = x.User.InterestIds?.Intersect(currentUserInterests).Count() ?? 0;
                        return x.User;
                    })
                    .ToList();
            }

            // Otherwise, just populate common tags count and return 
            foreach (var user in results)
            {
                user.CommonTagsCount = user.InterestIds?.Intersect(currentUserInterests).Count() ?? 0;
            }

            return results;
        }

        private double CalculateKnnDistance(AppUser me, HashSet<Guid> myInterests, BrowseUserDto them)
        {
            // Normalize Geo Distance to max 20,000km for searches
            double geoDist = Math.Min(them.DistanceInMeters, 20_000_000.0) / 20_000_000.0;
            double fameDist = Math.Min(Math.Abs(me.FameRating - them.FameRating), 100.0) / 100.0;

            var commonCount = them.InterestIds?.Intersect(myInterests).Count() ?? 0;
            double interestGap = 1.0 - ((double)commonCount / Math.Max(myInterests.Count, 1));

            // In Search, we weight everything equally unless specified
            return Math.Sqrt(
                Math.Pow(0.33 * geoDist, 2) +
                Math.Pow(0.33 * interestGap, 2) +
                Math.Pow(0.33 * fameDist, 2)
            );
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
                _ => new List<Gender> { Gender.Male, Gender.Female }
            };
        }
    }
}
