using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Users.Commands.LikeUser
{
    public class UnLikeUserCommand : IRequest<Response<bool>>
    {
        public Guid UserIdToUnLike { get; set; }
    }

    public class UnLikeUserCommandHandler : IRequestHandler<UnLikeUserCommand, Response<bool>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserServiceAsync _userService;

        public UnLikeUserCommandHandler(IAuthenticatedUser authenticatedUser, IUserServiceAsync userService)
        {
            this._authenticatedUser = authenticatedUser;
            this._userService = userService;
        }
        public async Task<Response<bool>> Handle(UnLikeUserCommand request, CancellationToken cancellationToken)
        {
            var result = await _userService.UnLikeUserAsync(request.UserIdToUnLike);
            return new Response<bool>(result);
        }
    }
}
