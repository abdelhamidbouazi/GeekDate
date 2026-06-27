using sparkdates.Application.Dtos.InterestDtos;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Interests.Commands.UptdaeInterest
{
    public class UpdateInterestCommand : IRequest<Response<bool>>
    {
        public Guid InterestId { get; set; }
        public UpdateInterestDto updateInterestDto { get; set; }
    }
}
