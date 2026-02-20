using matcha.Application.Dtos.Users;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Profile.Queries.WhoViewedMe
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
