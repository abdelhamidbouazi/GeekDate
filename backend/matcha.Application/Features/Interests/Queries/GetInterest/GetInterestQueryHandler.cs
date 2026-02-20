using matcha.Application.Dtos.InterestDtos;
using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Interests.Queries.GetInterest
{
    public class GetInterestQueryHandler : IRequestHandler<GetInterestQuery, Response<GetInterestDto>>
    {
        private readonly IInterestService _interestService;

        public GetInterestQueryHandler(IInterestService interestService)
        {
            _interestService = interestService;
        }
        public async Task<Response<GetInterestDto>> Handle(GetInterestQuery request, CancellationToken cancellationToken)
        {
            var interest = await _interestService.GetInterestByIdAsync(request.Id);

            return new Response<GetInterestDto>(interest);
        }
    }
}
