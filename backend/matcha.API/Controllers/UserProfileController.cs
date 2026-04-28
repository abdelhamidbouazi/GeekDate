using matcha.Application.Dtos.Users;
using matcha.Application.Features.Profile.Commands.CompleteUserPreferences;
using matcha.Application.Features.Profile.Commands.UpdateUserProfile;
using matcha.Application.Features.Profile.Queries.GetConnectedProfile;
using matcha.Application.Features.Users.Commands.CompleteUserProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace matcha.API.Controllers
{
    public class UserProfileController : BaseApiController
    {
        private readonly IMediator _mediator;

        public UserProfileController(IMediator mediator)
        {
            _mediator = mediator;
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
            //request.Pictures = pictures;
            return Ok(await _mediator.Send(request));
        }

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<ActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command)
        {
            System.IO.File.AppendAllText("C:\\temp\\update-profile-log.txt",
                $"[{DateTime.Now}] Gender={command.Gender} ({(int)command.Gender}), SexualPrefs={command.SexualPreferences} ({(int)command.SexualPreferences}), FirstName={command.FirstName}, City={command.City}\n");
            return Ok(await _mediator.Send(command));
        }
    }
}
