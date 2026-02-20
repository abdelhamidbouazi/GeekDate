using matcha.Application.Dtos.InterestDtos;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Interests.Queries.GetInterest
{
    public class GetInterestQuery : IRequest<Response<GetInterestDto>>
    {
        public Guid Id { get; set; }
    }
}
