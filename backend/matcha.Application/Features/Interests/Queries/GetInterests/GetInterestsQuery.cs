using sparkdates.Application.Dtos.InterestDtos;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Interests.Queries.GetInterests
{
    public class GetInterestsQuery : IRequest<Response<IReadOnlyCollection<GetInterestsDto>>>
    {
    }
}
