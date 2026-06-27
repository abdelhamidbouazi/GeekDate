using sparkdates.Application.Dtos.Users;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Users.Commands.CompleteUserProfile
{
    public class CompleteUserProfileCommand : IRequest<Response<UserProfileDto>>
    {
        public Guid UserId { get; set; }
        public BasicUserProfileDto BasicUserProfileDto { get; set; }
    }
}
