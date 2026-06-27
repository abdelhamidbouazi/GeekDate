using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Users.Commands.BlockUser
{
    public class BlockUserCommand : IRequest<Response<string>>
    {
        public Guid UserIdToBlock { get; set; }
    }
    public class BlockUserCommandHandler : IRequestHandler<BlockUserCommand, Response<string>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserServiceAsync _userService;

        public BlockUserCommandHandler(IAuthenticatedUser authenticatedUser, IUserServiceAsync userService)
        {
            this._authenticatedUser = authenticatedUser;
            this._userService = userService;
        }

        public async Task<Response<string>> Handle(BlockUserCommand request, CancellationToken cancellationToken)
        {
            var result = await _userService.BlockUserAsync(request.UserIdToBlock);
            return new Response<string>("User blocked successfully");
        }
    }
}
