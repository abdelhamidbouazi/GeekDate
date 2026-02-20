using matcha.Application.Dtos.Users;
using matcha.Application.Interfaces.Services;
using matcha.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace matcha.API.Controllers
{
    [Authorize]
    [Route("api/search/preferences")]
    [ApiController]
    public class UserSearchPreferencesController : ControllerBase
    {
        private readonly IUserSearchPreferencesServiceAsync _searchPreferencesService;

        public UserSearchPreferencesController(IUserSearchPreferencesServiceAsync searchPreferencesService)
        {
            _searchPreferencesService = searchPreferencesService;
        }

        /// <summary>
        /// Get current user's search preferences
        /// GET /api/search/preferences
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<SearchPreferencesDto>> Get()
        {
            try
            {
                var userId = GetCurrentUserId();
                var preferences = await _searchPreferencesService.GetByUserIdAsync(userId);
                return Ok(preferences);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update current user's search preferences
        /// PUT /api/search/preferences
        /// </summary>
        [HttpPut]
        public async Task<ActionResult> Update([FromBody] SearchPreferencesDto request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var preferences = new UserSearchPreference
                {
                    MinAge = request.MinAge,
                    MaxAge = request.MaxAge,
                    MinFameRating = request.MinFameRating,
                    MaxFameRating = request.MaxFameRating,
                    MaxDistanceKm = request.MaxDistanceKm
                };

                await _searchPreferencesService.UpdateAsync(userId, preferences);

                return Ok(new { message = "Preferences updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Reset search preferences to defaults
        /// POST /api/search/preferences/reset
        /// </summary>
        [HttpPost("reset")]
        public async Task<ActionResult> Reset()
        {
            try
            {
                var userId = GetCurrentUserId();

                var defaultPreferences = new UserSearchPreference
                {
                    MinAge = 18,
                    MaxAge = 100,
                    MinFameRating = 0,
                    MaxFameRating = 200,
                    MaxDistanceKm = 50
                };

                await _searchPreferencesService.UpdateAsync(userId, defaultPreferences);

                return Ok(new { message = "Preferences reset to defaults" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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