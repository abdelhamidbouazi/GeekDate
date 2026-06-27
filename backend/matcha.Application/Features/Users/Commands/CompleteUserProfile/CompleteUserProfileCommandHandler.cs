using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Users.Commands.CompleteUserProfile
{
    public class CompleteUserProfileCommandHandler : IRequestHandler<CompleteUserProfileCommand, Response<UserProfileDto>>
    {
        private readonly IUserProfileService _userProfileService;

        public CompleteUserProfileCommandHandler(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }

        public async Task<Response<UserProfileDto>> Handle(CompleteUserProfileCommand request, CancellationToken cancellationToken)
        {
            return new Response<UserProfileDto>(await _userProfileService.CompleteBasicUserProfileAsync(request.BasicUserProfileDto));
        }
    }
}
