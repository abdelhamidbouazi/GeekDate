using sparkdates.Application.Dtos.InterestDtos;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Interests.Queries.GetInterests
{
    public class GetInterestsQueryHandler : IRequestHandler<GetInterestsQuery, Response<IReadOnlyCollection<GetInterestsDto>>>
    {
        private readonly IInterestService _interestService;

        public GetInterestsQueryHandler(IInterestService interestService)
        {
            _interestService = interestService;
        }

        public async Task<Response<IReadOnlyCollection<GetInterestsDto>>> Handle(GetInterestsQuery request,
                        CancellationToken cancellationToken)
        {
            var interests = await _interestService.GetAllInterestsAsync();

            return new Response<IReadOnlyCollection<GetInterestsDto>>(interests);
        }
    }
}
