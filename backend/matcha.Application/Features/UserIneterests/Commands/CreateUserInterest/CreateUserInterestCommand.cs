using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Commands.CreateUserInterest
{
    public class CreateUserInterestCommand : IRequest<Response<UserInterestDto>>
    {
        public CreateUserInterestDto CreateUserInterestDto { get; set; }
    }
}
