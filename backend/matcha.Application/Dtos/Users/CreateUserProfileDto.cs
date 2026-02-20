using matcha.Domain.Common.Enums;

namespace matcha.Application.Dtos.Users
{
    public class CreateUserProfileDto
    {
        public Gender Gender { get; set; }
        public SexualPreferences SexualPreferences { get; set; }
        public string? Biography { get; set; }
        public List<Guid> InterestIds { get; set; }
        //public string? LookingFor { get; set; }
        //public string? City { get; set; }
        //public string? Country { get; set; }
        //public List<Photo> Photos { get; set; }
    }
}
