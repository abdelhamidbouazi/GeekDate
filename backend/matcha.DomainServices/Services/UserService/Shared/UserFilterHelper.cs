using matcha.Application.Dtos.Users;
using matcha.Domain.Common.Enums;
using matcha.Domain.Entities;

namespace matcha.DomainServices.Services.UserService.Shared
{
    public static class UserFilterHelper
    {
        public static List<Gender> DeterminePreferredGenders(AppUser user)
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

        public static void CalculateCommonTags(
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
    }
}
