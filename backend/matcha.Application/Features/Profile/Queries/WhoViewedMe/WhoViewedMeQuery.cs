using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Profile.Queries.WhoViewedMe
{
    public class WhoViewedMeQuery : IRequest<Response<IEnumerable<UserProfileViewerDto>>>
    {
    }

    public class WhoViewedMeQueryHandler : IRequestHandler<WhoViewedMeQuery, Response<IEnumerable<UserProfileViewerDto>>>
    {
        private readonly IAuthenticatedUser authenticatedUser;
        private readonly IUserProfileService _userProfileService;

        public WhoViewedMeQueryHandler(IAuthenticatedUser authenticatedUser, IUserProfileService userProfileService)
        {
            this.authenticatedUser = authenticatedUser;
            _userProfileService = userProfileService;
        }

        public async Task<Response<IEnumerable<UserProfileViewerDto>>> Handle(WhoViewedMeQuery request, CancellationToken cancellationToken)
        {
            var viewers = await _userProfileService.GetWhoViewedMeAsync(authenticatedUser.UserId);
            return new Response<IEnumerable<UserProfileViewerDto>>(viewers);
        }
    }

}
