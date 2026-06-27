using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Queries.GetUserInterest
{
    public class GetUserInterestQuery : IRequest<Response<GetUserInterestDto>>
    {
        public Guid Id { get; set; }
    }
}
