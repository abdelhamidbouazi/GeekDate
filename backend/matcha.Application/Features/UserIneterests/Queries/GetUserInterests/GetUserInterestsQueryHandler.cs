using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Queries.GetUserInterests
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
