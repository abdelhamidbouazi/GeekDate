using matcha.Domain.Common.Enums;
using Microsoft.AspNetCore.Http;

namespace matcha.Application.Dtos.Users
{
    public class BasicUserProfileDto
    {
        public IFormFile MainPicture { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public List<IFormFile> Photos { get; set; }
    }
}
