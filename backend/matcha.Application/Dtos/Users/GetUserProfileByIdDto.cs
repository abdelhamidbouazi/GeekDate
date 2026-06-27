using sparkdates.Domain.Common.Enums;
using sparkdates.Domain.Entities;

namespace sparkdates.Application.Dtos.Users
{
    public class GetUserProfileByIdDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public Gender Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string? KnownAs { get; set; }
        public string? Biography { get; set; }
        public string? LookingFor { get; set; }
        public List<UserInterest> Interests { get; set; }
        public SexualPreferences SexualPreferences { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public List<Photo> Photos { get; set; }
        public DateTime LastActive { get; set; }
    }
}
