using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Profile.Commands.SetProfilePicture
{
    public class SetProfilePictureCommand : IRequest<Response<bool>>
    {
        public Guid PictureId { get; set; }
    }

    public class SetProfilePictureCommandHandler : IRequestHandler<SetProfilePictureCommand, Response<bool>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserProfileService _profileService;

        public SetProfilePictureCommandHandler(IAuthenticatedUser authenticatedUser, IUserProfileService userService)
        {
            _authenticatedUser = authenticatedUser;
            _profileService = userService;
        }

        public async Task<Response<bool>> Handle(SetProfilePictureCommand request, CancellationToken cancellationToken)
        {
            var result = await _profileService.SetProfilePictureAsync(_authenticatedUser.UserId, request.PictureId);
            return new Response<bool>(result);
        }
    }
}
