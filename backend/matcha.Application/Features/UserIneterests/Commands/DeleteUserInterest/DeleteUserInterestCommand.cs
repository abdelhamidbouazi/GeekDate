using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Commands.DeleteUserInterest
{
    public class DeleteUserInterestCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
    }
}
