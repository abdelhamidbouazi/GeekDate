using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Users.Commands.LikeUser
{
    public class LikeUserCommand : IRequest<Response<string>>
    {
        public Guid TargetUserId { get; set; }

    }

    public class LikeUserCommandHandler : IRequestHandler<LikeUserCommand, Response<string>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserServiceAsync _userService;

        public LikeUserCommandHandler(IAuthenticatedUser authenticatedUser, IUserServiceAsync userService)
        {
            _authenticatedUser = authenticatedUser;
            _userService = userService;
        }

        public async Task<Response<string>> Handle(LikeUserCommand request, CancellationToken cancellationToken)
        {
            var result = await _userService.LikeUserAsync(request.TargetUserId);
            return new Response<string>("User liked successfully");
        }
    }
}
