using matcha.Domain.Common.Enums;
using matcha.Domain.Entities;

namespace matcha.Application.Dtos.Users
{
    public class GetAllUserProfilesDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public Gender Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string? KnownAs { get; set; }
        public SexualPreferences SexualPreferences { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public List<Photo> Photos { get; set; }
        public DateTime LastActive { get; set; }
    }
}
