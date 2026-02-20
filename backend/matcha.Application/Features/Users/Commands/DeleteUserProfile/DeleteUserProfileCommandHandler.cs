using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Users.Commands.DeleteUserProfile
{
    public class DeleteUserProfileCommandHandler : IRequestHandler<DeleteUserProfileCommand,
            Response<bool>>
    {
        private readonly IUserProfileService _userProfileService;

        public DeleteUserProfileCommandHandler(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }

        public async Task<Response<bool>> Handle(DeleteUserProfileCommand request, CancellationToken cancellationToken)
        {
            var record = await _userProfileService.DeleteUser(request.Id);

            return new Response<bool>(record);
        }
    }
}
