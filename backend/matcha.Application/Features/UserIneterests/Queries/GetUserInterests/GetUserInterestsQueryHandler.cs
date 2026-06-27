using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Queries.GetUserInterests
{
    public class GetUserInterestsQueryHandler : IRequestHandler<GetUserInterestsQuery, Response<IReadOnlyCollection<GetUserInterestsDto>>>
    {
        private readonly IUserInterestsService _userInterestsService;

        public GetUserInterestsQueryHandler(IUserInterestsService userInterestsService)
        {
            _userInterestsService = userInterestsService;
        }

        public async Task<Response<IReadOnlyCollection<GetUserInterestsDto>>> Handle(GetUserInterestsQuery request, CancellationToken cancellationToken)
        {
            var userInterests = await _userInterestsService.GetUserInterestsAsync(request.UserId);

            return new Response<IReadOnlyCollection<GetUserInterestsDto>>(userInterests);
        }
    }
}
