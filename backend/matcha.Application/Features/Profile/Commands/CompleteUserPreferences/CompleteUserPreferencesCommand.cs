using sparkdates.Application.Dtos.Users;
using sparkdates.Application.ResponseWrappers;
using sparkdates.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace sparkdates.Application.Features.Profile.Commands.CompleteUserPreferences
{
    public class CompleteUserPreferencesCommand : IRequest<Response<UserProfileDto>>
    {
        public Guid UserId { get; set; }
        public string Biography { get; set; }
        public SexualPreferences PreferredGender { get; set; }
        public List<Guid> UserInterestIds { get; set; }
        public Gender Gender { get; set; }
        public IEnumerable<IFormFile>? Pictures { get; set; }
    }
    public class UserPicture
    {
        public IFormFile PictureFile { get; set; }
        public bool IsMain { get; set; }
    }
}
