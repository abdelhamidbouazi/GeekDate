using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Interests.Commands.DeleteInterest
{
    public class DeleteInterestCommandHandler : IRequestHandler<DeleteInterestCommand, Response<bool>>
    {
        private readonly IInterestService _interestService;

        public DeleteInterestCommandHandler(IInterestService interestService)
        {
            _interestService = interestService;
        }

        public async Task<Response<bool>> Handle(DeleteInterestCommand request, CancellationToken cancellationToken)
        {
            var result = await _interestService.DeleteInterest(request.Id);

            return new Response<bool>(result);
        }
    }
}
