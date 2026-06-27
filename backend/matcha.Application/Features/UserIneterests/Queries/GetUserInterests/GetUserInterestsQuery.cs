using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Queries.GetUserInterests
{
    public class GetUserInterestsQuery : IRequest<Response<IReadOnlyCollection<GetUserInterestsDto>>>
    {
        public Guid UserId { get; set; }
    }
}
