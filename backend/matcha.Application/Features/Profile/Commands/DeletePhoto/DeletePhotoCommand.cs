using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Profile.Commands.DeletePhoto
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
