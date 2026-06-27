using sparkdates.Application.Dtos.InterestDtos;
using sparkdates.Application.Features.Interests.Commands.CreateInterest;
using sparkdates.Application.Features.Interests.Commands.DeleteInterest;
using sparkdates.Application.Features.Interests.Commands.UptdaeInterest;
using sparkdates.Application.Features.Interests.Queries.GetInterest;
using sparkdates.Application.Features.Interests.Queries.GetInterests;
using sparkdates.Application.Features.UserIneterests.Queries.GetInterestsList;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace sparkdates.API.Controllers
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

        [HttpGet("list")]
        public async Task<IActionResult> GetList()
        {
            return Ok(await _mediator.Send(new GetInterestsListQuery()));
        }

        [HttpGet("{interestId:guid}")]
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
