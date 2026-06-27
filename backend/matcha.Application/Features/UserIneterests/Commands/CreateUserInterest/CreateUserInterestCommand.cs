using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Commands.CreateUserInterest
{
    public class CreateUserInterestCommand : IRequest<Response<UserInterestDto>>
    {
        public CreateUserInterestDto CreateUserInterestDto { get; set; }
    }
}
