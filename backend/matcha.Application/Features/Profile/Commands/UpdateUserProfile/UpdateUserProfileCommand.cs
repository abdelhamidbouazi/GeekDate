using sparkdates.Application.Dtos.Users;
using sparkdates.Application.ResponseWrappers;
using sparkdates.Domain.Common.Enums;
using MediatR;

namespace sparkdates.Application.Features.Profile.Commands.UpdateUserProfile
{
    public class UpdateUserProfileCommand : IRequest<Response<UserProfileDto>>
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public Gender Gender { get; set; }
        public string Biography { get; set; }
        public SexualPreferences SexualPreferences { get; set; }
        public List<Guid> UserInterestIds { get; set; }
        public string City { get; set; }
    }
}
