using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Profile.Commands.ProfileViewed
{
    public class ProfileViewedCommand : IRequest<Response<bool>>
    {
        public Guid ProfileId { get; set; }
    }

    public class ProfileViewedCommandHandler : IRequestHandler<ProfileViewedCommand, Response<bool>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserServiceAsync _userService;

        public ProfileViewedCommandHandler(IAuthenticatedUser authenticatedUser, IUserServiceAsync userService)
        {
            _authenticatedUser = authenticatedUser;
            _userService = userService;
        }

        public async Task<Response<bool>> Handle(ProfileViewedCommand request, CancellationToken cancellationToken)
        {
            var result = await _userService.MarkProfileAsViewedAsync(request.ProfileId);
            return new Response<bool>(result);
        }
    }
}
