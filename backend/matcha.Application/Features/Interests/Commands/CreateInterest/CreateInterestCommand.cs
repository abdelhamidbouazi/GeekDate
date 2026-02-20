using matcha.Application.Dtos.InterestDtos;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Interests.Commands.CreateInterest
{
    public class CreateInterestCommand : IRequest<Response<InterestDto>>
    {
        public CreateInterestDto CreateInterestDto { get; set; }
    }
}
