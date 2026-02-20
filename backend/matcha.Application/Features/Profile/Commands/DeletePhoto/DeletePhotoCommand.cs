using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Profile.Commands.DeletePhoto
{
    public class DeletePhotoCommand : IRequest<Response<bool>>
    {
        public Guid PhotoId { get; set; }
    }

    public class DeletePhotoCommandHandler : IRequestHandler<DeletePhotoCommand, Response<bool>>
    {
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IUserProfileService _profileService;

        public DeletePhotoCommandHandler(IAuthenticatedUser authenticatedUser, IUserProfileService userService)
        {
            _authenticatedUser = authenticatedUser;
            _profileService = userService;
        }

        public async Task<Response<bool>> Handle(DeletePhotoCommand request, CancellationToken cancellationToken)
        {
            var result = await _profileService.DeletePhotoAsync(_authenticatedUser.UserId, request.PhotoId);
            return new Response<bool>(result);
        }
    }
}
