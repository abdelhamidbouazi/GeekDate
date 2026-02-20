using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Profile.Commands.SetUserLocation
{
    public class SetUserLocationCommand : IRequest<Response<bool>>
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class SetUserLocationCommandHandler : IRequestHandler<SetUserLocationCommand, Response<bool>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserProfileService _profileService;

        public SetUserLocationCommandHandler(IAuthenticatedUser authenticatedUser, IUserProfileService userService)
        {
            _authenticatedUser = authenticatedUser;
            _profileService = userService;
        }

        public async Task<Response<bool>> Handle(SetUserLocationCommand request, CancellationToken cancellationToken)
        {
            var result = await _profileService.SetUserLocationAsync(_authenticatedUser.UserId, request.Latitude, request.Longitude);
            return new Response<bool>(result);
        }
    }
}
