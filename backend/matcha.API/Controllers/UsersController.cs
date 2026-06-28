using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace sparkdates.API.Controllers
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

        [HttpGet("{userId:Guid}")]
        public async Task<ActionResult> GetUserByUserId(Guid userId)
        {
            var user = await userServiceAsync.GetUserByIdAsync(userId);
            var likeStatus = await userServiceAsync.GetLikeStatusAsync(userId);

            return Ok(new
            {
                user.FirstName,
                user.LastName,
                user.UserName,
                user.Email,
                user.Gender,
                user.DateOfBirth,
                user.Biography,
                SexualPreferences = user.PreferredGender,
                user.Interests,
                user.City,
                user.Country,
                user.Photos,
                user.LastActive,
                user.FameRating,
                IsLikedByMe = likeStatus.IsLikedByMe,
                IsLikedByThem = likeStatus.IsLikedByThem,
                IsMatched = likeStatus.IsMatched,
            });
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
        public async Task<ActionResult> SetMainPhoto(Guid photoId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId is null) return BadRequest("Cannot get user ID from token.");

            if (await userServiceAsync.SetMainPhoto(photoId, Guid.Parse(userId)))
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

        [HttpDelete("unblock-profile/{userToUnblock:Guid}")]
        public async Task<ActionResult> UnblockProfile(Guid userToUnblock)
        {
            if (authenticatedUser.UserId == userToUnblock)
                return BadRequest("You cannot unblock your own profile.");

            if (await userServiceAsync.UnblockUserAsync(userToUnblock))
                return NoContent();

            return BadRequest("Failed to unblock the profile.");
        }

        [HttpGet("profile-likes")]
        public async Task<ActionResult> GetProfileLikes()
        {
            var result = await userServiceAsync.GetWhoLikedMeAsync(authenticatedUser.UserId);

            return Ok(result);
        }

        [HttpGet("likes-given")]
        public async Task<ActionResult> GetLikesGiven()
        {
            var result = await userServiceAsync.GetLikesGivenAsync(authenticatedUser.UserId);

            return Ok(result);
        }
    }
}
