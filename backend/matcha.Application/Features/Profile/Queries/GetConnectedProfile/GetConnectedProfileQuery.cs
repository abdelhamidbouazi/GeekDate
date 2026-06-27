using sparkdates.Application.Dtos.Profile;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Profile.Queries.GetConnectedProfile
{
    public class GetConnectedProfileQuery : IRequest<Response<ConnectedUserProfileDto>>
    {
    }

    public class GetConnectedProfileQueryHandler : IRequestHandler<GetConnectedProfileQuery, Response<ConnectedUserProfileDto>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserProfileService _userService;

        public GetConnectedProfileQueryHandler(IAuthenticatedUser authenticatedUser, IUserProfileService userService)
        {
            _authenticatedUser = authenticatedUser;
            _userService = userService;
        }

        public async Task<Response<ConnectedUserProfileDto>> Handle(GetConnectedProfileQuery request, CancellationToken cancellationToken)
        {
            var profile = await _userService.GetConnectedProfileAsync(_authenticatedUser.UserId);
            return new Response<ConnectedUserProfileDto>(profile);
        }
    }
}
