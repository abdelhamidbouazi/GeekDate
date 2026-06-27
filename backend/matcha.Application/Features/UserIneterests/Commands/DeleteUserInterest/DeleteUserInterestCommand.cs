using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Commands.DeleteUserInterest
{
    public class DeleteUserInterestCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
    }
}
