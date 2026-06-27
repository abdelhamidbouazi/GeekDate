using sparkdates.Domain.Common.Enums;
using Microsoft.AspNetCore.Http;

namespace sparkdates.Application.Dtos.Users
{
    public class PreferencesAndInterestsDto
    {
        public string? Biography { get; set; }
        public SexualPreferences PreferredGender { get; set; }
        public List<Guid> UserInterestIds { get; set; }
        public IEnumerable<IFormFile> Pictures { get; set; }
    }
}
