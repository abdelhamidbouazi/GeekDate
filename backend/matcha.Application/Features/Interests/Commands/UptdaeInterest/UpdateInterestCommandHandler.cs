using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Interests.Commands.UptdaeInterest
{
    public class UpdateInterestCommandHandler : IRequestHandler<UpdateInterestCommand, Response<bool>>
    {
        private readonly IInterestService _interestService;

        public UpdateInterestCommandHandler(IInterestService interestService)
        {
            _interestService = interestService;
        }

        public async Task<Response<bool>> Handle(UpdateInterestCommand request, CancellationToken cancellationToken)
        {
            var result = await _interestService.UpdateInterest(request.InterestId, request.updateInterestDto);

            return new Response<bool>(result);
        }
    }
}
