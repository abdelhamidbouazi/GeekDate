using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Queries.GetUserInterest
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
