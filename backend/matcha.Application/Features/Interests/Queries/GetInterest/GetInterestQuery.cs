using sparkdates.Application.Dtos.InterestDtos;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Interests.Queries.GetInterest
{
    public class GetInterestQuery : IRequest<Response<GetInterestDto>>
    {
        public Guid Id { get; set; }
    }
}
