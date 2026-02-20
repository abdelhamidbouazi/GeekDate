using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Commands.UpdateUserInterest
{
    public class UpdateUserInterestCommand : IRequest<Response<UserInterestDto>>
    {
        public Guid id { get; set; }
        public UpdateUserInterestDto UpdateUserInterestDto { get; set; }
    }
}
