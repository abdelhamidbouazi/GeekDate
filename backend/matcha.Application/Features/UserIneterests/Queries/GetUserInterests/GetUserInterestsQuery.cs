using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Queries.GetUserInterests
{
    public class GetUserInterestsQuery : IRequest<Response<IReadOnlyCollection<GetUserInterestsDto>>>
    {
        public Guid UserId { get; set; }
    }
}
