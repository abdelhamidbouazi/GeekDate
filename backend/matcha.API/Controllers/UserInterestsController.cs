using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.Features.UserIneterests.Commands.CreateUserInterest;
using sparkdates.Application.Features.UserIneterests.Commands.DeleteUserInterest;
using sparkdates.Application.Features.UserIneterests.Commands.UpdateUserInterest;
using sparkdates.Application.Features.UserIneterests.Queries.GetUserInterest;
using sparkdates.Application.Features.UserIneterests.Queries.GetUserInterests;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace sparkdates.API.Controllers
{
    public class UserInterestsController : BaseApiController
    {
        private readonly IMediator _mediator;

        public UserInterestsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IReadOnlyCollection<GetUserInterestsDto>>> GetAll()
        {
            return Ok(await _mediator.Send(new GetUserInterestsQuery()));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetUserInterestDto>> GetById(Guid id)
        {
            return Ok(await _mediator.Send(new GetUserInterestQuery { Id = id }));
        }

        [HttpPost("create")]
        public async Task<ActionResult<UserInterestDto>> Create([FromBody] CreateUserInterestDto createUserInterestDto)
        {
            return Ok(await _mediator.Send(new CreateUserInterestCommand { CreateUserInterestDto = createUserInterestDto }));
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult<UserInterestDto>> Update(Guid id, [FromBody] UpdateUserInterestDto updateUserInterestDto)
        {
            var response = await _mediator.Send(new UpdateUserInterestCommand { id = id, UpdateUserInterestDto = updateUserInterestDto });

            if (!response.IsSucceeded)
                return BadRequest();

            return Ok(response);
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult<bool>> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteUserInterestCommand { Id = id });

            return result.Data ? Ok() : BadRequest();
        }
    }
}
