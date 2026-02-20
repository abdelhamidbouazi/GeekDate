using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Users.Commands.DeleteUserProfile
{
    public class DeleteUserProfileCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
    }
}
