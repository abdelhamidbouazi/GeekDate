using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Features.Profile.Commands.CompleteUserPreferences;
using sparkdates.Application.Features.Profile.Commands.SetUserLocation;
using sparkdates.Application.Features.Profile.Commands.UpdateUserProfile;
using sparkdates.Application.Features.Profile.Queries.GetConnectedProfile;
using sparkdates.Application.Features.Users.Commands.CompleteUserProfile;
using sparkdates.Application.Interfaces.Services;
using System.Security.Claims;

namespace sparkdates.API.Controllers
{
    public class UserProfileController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly IUserProfileService _userProfileService;

        public UserProfileController(IMediator mediator, IUserProfileService userProfileService)
        {
            _mediator = mediator;
            _userProfileService = userProfileService;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult> GetMyProfile()
        {
            return Ok(await _mediator.Send(new GetConnectedProfileQuery()));
        }

        [Authorize]
        [HttpPut("complete-basic-profile")]
        public async Task<ActionResult> Create([FromForm] BasicUserProfileDto basicUserProfileDto)
        {
            return Ok(await _mediator.Send(new CompleteUserProfileCommand { BasicUserProfileDto = basicUserProfileDto }));
        }

        [Authorize]
        [HttpPut("complete-preferences")]
        public async Task<ActionResult> UpdatePreferences([FromForm] CompleteUserPreferencesCommand request)
        {
            return Ok(await _mediator.Send(request));
        }

        [Authorize]
        [HttpPost("set-location")]
        public async Task<ActionResult> SetLocation([FromBody] SetUserLocationCommand command)
        {
            return Ok(await _mediator.Send(command));
        }

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<ActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command)
        {
            return Ok(await _mediator.Send(command));
        }

        [Authorize]
        [HttpGet("blocked-users")]
        public async Task<ActionResult> GetBlockedUsers()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId is null)
                return BadRequest("Unable to retrieve user ID from the token.");

            var blockedUsers = await _userProfileService.GetUserBlocksAsync(Guid.Parse(userId));
            return Ok(blockedUsers.UserBlocks);
        }
    }
}
