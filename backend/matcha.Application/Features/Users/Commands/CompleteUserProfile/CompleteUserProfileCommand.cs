using matcha.Application.Dtos.Users;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Users.Commands.CompleteUserProfile
{
    public class CompleteUserProfileCommand : IRequest<Response<UserProfileDto>>
    {
        public Guid UserId { get; set; }
        public BasicUserProfileDto BasicUserProfileDto { get; set; }
    }
}
