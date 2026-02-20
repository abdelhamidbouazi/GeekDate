using matcha.Application.Dtos.InterestDtos;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Interests.Commands.UptdaeInterest
{
    public class UpdateInterestCommand : IRequest<Response<bool>>
    {
        public Guid InterestId { get; set; }
        public UpdateInterestDto updateInterestDto { get; set; }
    }
}
