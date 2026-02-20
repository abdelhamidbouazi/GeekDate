using matcha.Application.Dtos.InterestDtos;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Interests.Queries.GetInterests
{
    public class GetInterestsQuery : IRequest<Response<IReadOnlyCollection<GetInterestsDto>>>
    {
    }
}
