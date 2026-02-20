using matcha.Application.Dtos.Users;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace matcha.API.Controllers
{


    [Authorize]
    public class UsersController(IUserServiceAsync userServiceAsync, IAuthenticatedUser authenticatedUser) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult> GetUsers()
        {
            var users = await userServiceAsync.GetUsersAsync();

            return Ok(users);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var user = await userServiceAsync.GetUserAuthenticatedInfos(User);

            return Ok(user);
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult> GetUserByUserId(Guid userId)
        {
            var user = await userServiceAsync.GetUserByIdAsync(userId);

            return Ok(user);
        }

        [HttpPost("upload-image")]
        public async Task<ActionResult<ImageDto>> UploadImage([FromForm] IFormFile file)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId is null) return BadRequest("Cannot get username from token.");

            try
            {
                var result = await userServiceAsync.UploadImage(Guid.Parse(userId), file, false);

                return CreatedAtAction(nameof(UploadImage), new { userId = Guid.Parse(userId) }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("set-main-photo/{photoId:Guid}")]
        public async Task<ActionResult> SetMainPhoto(Guid photoId, Guid userId)
        {
            if (await userServiceAsync.SetMainPhoto(userId, photoId))
                return NoContent();

            return BadRequest("There was an issue setting the main photo. Please try again later.");
        }

        [HttpDelete("delete-photo/{photoId:Guid}")]
        public async Task<ActionResult> DeletePhoto(Guid photoId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId is null) return BadRequest("Unable to retrieve user ID from the token. Please try logging in again.");

            if (await userServiceAsync.DeletePhoto(Guid.Parse(userId), photoId))
                return NoContent();

            return BadRequest("Failed to delete the photo. Please try again.");
        }

        [HttpPost("like-profile/{userToLike:Guid}")]
        public async Task<ActionResult> LikeProfile(Guid userToLike)
        {
            if (authenticatedUser.UserId == userToLike)
                return BadRequest("You cannot like your own profile.");

            if (await userServiceAsync.LikeUserAsync(userToLike))
                return NoContent();

            return BadRequest("Failed to like the user.");
        }

        [HttpPost("mark-profile-as-viewed/{userId:Guid}")]
        public async Task<ActionResult> MarkProfileAsViewed(Guid userId)
        {
            if (await userServiceAsync.MarkProfileAsViewedAsync(userId))
                return NoContent();

            return BadRequest("Failed to mark the profile as viewed.");
        }

        [HttpGet("profile-views")]
        public async Task<ActionResult> GetProfileViews()
        {
            var result = await userServiceAsync.GetWhoViewedMeAsync(authenticatedUser.UserId);
            return Ok(result);
        }

        [HttpPost("unlike-profile/{userToUnlike:Guid}")]
        public async Task<ActionResult> UnlikeProfile(Guid userToUnlike)
        {
            if (authenticatedUser.UserId == userToUnlike)
                return BadRequest("You cannot unlike your own profile.");

            if (await userServiceAsync.UnLikeUserAsync(userToUnlike))
                return NoContent();

            return BadRequest("Failed to unlike the user.");
        }

        [HttpPost("block-profile/{userToBlock:Guid}")]
        public async Task<ActionResult> BlockProfile(Guid userToBlock)
        {
            if (authenticatedUser.UserId == userToBlock)
                return BadRequest("You cannot block your own profile.");

            if (await userServiceAsync.BlockUserAsync(userToBlock))
                return NoContent();

            return BadRequest("Failed to block the profile.");
        }

        [HttpGet("profile-likes")]
        public async Task<ActionResult> GetProfileLikes()
        {
            var result = await userServiceAsync.GetWhoLikedMeAsync(authenticatedUser.UserId);

            return Ok(result);
        }
    }
}
