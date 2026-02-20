using matcha.Application.Dtos.Interests;
using matcha.Domain.Common.Enums;

namespace matcha.Application.Dtos.Profile
{
    public class ConnectedUserProfileDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public Gender Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Biography { get; set; }
        public SexualPreferences PreferredGender { get; set; }
        public IEnumerable<InterestDto> Interests { get; set; }
        public int ProfileViews { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public IEnumerable<UserPhotoDto> Pictures { get; set; } = [];
        public int UserLikes { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool IsBasicInfoComplete { get; set; }
        public bool IsPreferencesComplete { get; set; }
        public bool IsProfileCompleted { get; set; }
        public int FameRating { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
