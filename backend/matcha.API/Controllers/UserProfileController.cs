using matcha.Application.Dtos.Users;
using matcha.Application.Features.Profile.Commands.CompleteUserPreferences;
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

        //[HttpPut("{userId}/update-profile")]
        //public async Task<ActionResult> Update(Guid userId, UpdateUserProfileDto updateUserProfileDto)
        //{
        //    return Ok(await _mediator.Send(new UpdateUserProfileCommand { UserId = userId, UpdateUserProfileDto = updateUserProfileDto }));
        //}
    }
}
