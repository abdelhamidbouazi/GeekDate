using sparkdates.Domain.Common.Enums;

namespace sparkdates.Application.Dtos.Users
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Biography { get; set; }
        public Gender Gender { get; set; }
        public SexualPreferences LookingFor { get; set; }
        public IEnumerable<GetUserInterestsFromUserProfile> Interests { get; set; }
    }
}
