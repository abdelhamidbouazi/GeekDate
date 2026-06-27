using sparkdates.Application.Dtos.InterestDtos;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Interests.Commands.CreateInterest
{
    public class CreateInterestCommand : IRequest<Response<InterestDto>>
    {
        public CreateInterestDto CreateInterestDto { get; set; }
    }
}
