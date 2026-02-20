using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Queries.GetUserInterest
{
    public class GetUserInterestQuery : IRequest<Response<GetUserInterestDto>>
    {
        public Guid Id { get; set; }
    }
}
