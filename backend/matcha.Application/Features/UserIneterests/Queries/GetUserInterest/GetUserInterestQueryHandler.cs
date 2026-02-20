using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Queries.GetUserInterest
{
    public class GetUserInterestQueryHandler : IRequestHandler<GetUserInterestQuery, Response<GetUserInterestDto>>
    {
        private readonly IUserInterestsService _userInterestsService;

        public GetUserInterestQueryHandler(IUserInterestsService userInterestsService)
        {
            _userInterestsService = userInterestsService;
        }

        public async Task<Response<GetUserInterestDto>> Handle(GetUserInterestQuery request, CancellationToken cancellationToken)
        {
            var userInterest = await _userInterestsService.GetUserInterestAsync(request.Id);

            return new Response<GetUserInterestDto>(userInterest);
        }
    }
}
