using matcha.Application.Dtos.Users;
using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Users.Commands.CompleteUserProfile
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
