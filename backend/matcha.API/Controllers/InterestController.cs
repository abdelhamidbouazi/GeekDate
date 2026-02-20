using matcha.Application.Dtos.InterestDtos;
using matcha.Application.Features.Interests.Commands.CreateInterest;
using matcha.Application.Features.Interests.Commands.DeleteInterest;
using matcha.Application.Features.Interests.Commands.UptdaeInterest;
using matcha.Application.Features.Interests.Queries.GetInterest;
using matcha.Application.Features.Interests.Queries.GetInterests;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace matcha.API.Controllers
{
    public class InterestController : BaseApiController
    {
        private IMediator _mediator;

        public InterestController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _mediator.Send(new GetInterestsQuery()));
        }

        [HttpGet("{interestId}")]
        public async Task<ActionResult> GetById(Guid interestId)
        {
            return Ok(await _mediator.Send(new GetInterestQuery { Id = interestId }));
        }

        [HttpPost]
        public async Task<ActionResult> Create(CreateInterestDto interestDto)
        {
            return Ok(await _mediator.Send(new CreateInterestCommand { CreateInterestDto = interestDto }));
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult> Update([FromBody] UpdateInterestDto interestDto, Guid id)
        {
            var result = await _mediator.Send(new UpdateInterestCommand { InterestId = id, updateInterestDto = interestDto });

            return result.Data ? Ok(result.Data) : BadRequest();
        }

        [HttpDelete("{interesetId}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteInterestCommand { Id = id });

            return result.Data ? NoContent() : BadRequest();
        }
    }
}
