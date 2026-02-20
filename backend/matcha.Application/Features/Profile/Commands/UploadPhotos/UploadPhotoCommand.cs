using AutoMapper;
using matcha.Application.Dtos.Profile;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace matcha.Application.Features.Profile.Commands.UploadPhotos
{
    public class UploadPhotoCommand : IRequest<Response<IReadOnlyList<UserPhotoDto>>>
    {
        public List<IFormFile> Photos { get; set; }
    }

    public class UploadPhotoCommandHandler : IRequestHandler<UploadPhotoCommand, Response<IReadOnlyList<UserPhotoDto>>>
    {
        private readonly IUserProfileService _profileService;
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IMapper mapper;

        public UploadPhotoCommandHandler(IUserProfileService userService, IAuthenticatedUser authenticatedUser, IMapper mapper)
        {
            _profileService = userService;
            this._authenticatedUser = authenticatedUser;
            this.mapper = mapper;
        }

        public async Task<Response<IReadOnlyList<UserPhotoDto>>> Handle(UploadPhotoCommand request, CancellationToken cancellationToken)
        {
            var result = await _profileService.UploadPhotosAsync(request.Photos, _authenticatedUser.UserId);
            var photos = await _profileService.GetUserPhotosAsync(_authenticatedUser.UserId);
            return new Response<IReadOnlyList<UserPhotoDto>>(mapper.Map<IReadOnlyList<UserPhotoDto>>(photos));
        }
    }
}
