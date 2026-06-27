using sparkdates.Application.Dtos.InterestDtos;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Interests.Commands.CreateInterest
{
    public class CreateInterestCommandHandler : IRequestHandler<CreateInterestCommand, Response<InterestDto>>
    {
        private readonly IInterestService _interestService;

        public CreateInterestCommandHandler(IInterestService interestService)
        {
            _interestService = interestService;
        }
        public async Task<Response<InterestDto>> Handle(CreateInterestCommand request, CancellationToken cancellationToken)
        {
            var interest = await _interestService.CreateInterestAsync(request.CreateInterestDto);

            return new Response<InterestDto>(interest);
        }
    }
}
