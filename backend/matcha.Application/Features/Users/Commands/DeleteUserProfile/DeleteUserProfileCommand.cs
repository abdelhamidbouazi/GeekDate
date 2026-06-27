using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Users.Commands.DeleteUserProfile
{
    public class DeleteUserProfileCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
    }
}
