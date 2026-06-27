using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Specifications;
using Microsoft.AspNetCore.Mvc;

namespace sparkdates.API.Controllers
{
    public class MatchmakingController : BaseApiController
    {
        private readonly IMatchmakingServiceAsync _browseServiceAsync;
        private readonly IUserSearchServiceAsync _userSearchService;
        public MatchmakingController(IMatchmakingServiceAsync browseServiceAsync, IUserSearchServiceAsync userSearchServiceAsync)
        {
            _browseServiceAsync = browseServiceAsync;
            _userSearchService = userSearchServiceAsync;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BrowseUserDto>>> BrowseUsers()
        {
            var userId = GetCurrentUserId();

            var results = await _browseServiceAsync.BrowseUsersAsync(userId);
            return Ok(results);
        }

        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<BrowseUserDto>>> SearchUsers([FromBody] SearchPreferencesDto request)
        {
            var userId = GetCurrentUserId();

            SearchUsersSpecification spec = new SearchUsersSpecification
            {
                MinAge = request.MinAge < 18 ? 18 : request.MinAge,
                MaxAge = request.MaxAge,
                MinFameRating = request.MinFameRating,
                MaxFameRating = request.MaxFameRating,
                MaxDistanceMeters = request.MaxDistanceKm.HasValue ? request.MaxDistanceKm.Value * 1000 : null,
                RequiredInterestIds = request.SavedInterestIds,
                SortBy = request.SortBy,
                SortDescending = request.SortDescending
            };

            var results = await _userSearchService.SearchUsersAsync(userId, spec);

            return Ok(results);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");

            return Guid.Parse(userIdClaim);
        }
    }
}
