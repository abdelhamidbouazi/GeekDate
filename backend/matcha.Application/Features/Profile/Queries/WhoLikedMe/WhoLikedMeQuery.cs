using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Profile.Queries.WhoLikedMe
{
    public class WhoLikedMeQuery : IRequest<Response<IEnumerable<UserProfileLikedDto>>>
    {
    }

    public class WhoLlikedMeQueryHandler : IRequestHandler<WhoLikedMeQuery, Response<IEnumerable<UserProfileLikedDto>>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserProfileService _userProfileService;

        public WhoLlikedMeQueryHandler(IAuthenticatedUser authenticatedUser, IUserProfileService userProfileService)
        {
            _authenticatedUser = authenticatedUser;
            _userProfileService = userProfileService;
        }

        public async Task<Response<IEnumerable<UserProfileLikedDto>>> Handle(WhoLikedMeQuery request, CancellationToken cancellationToken)
        {
            var likes = await _userProfileService.GetWhoLikedMeAsync(_authenticatedUser.UserId);
            return new Response<IEnumerable<UserProfileLikedDto>>(likes);
        }
    }
}
