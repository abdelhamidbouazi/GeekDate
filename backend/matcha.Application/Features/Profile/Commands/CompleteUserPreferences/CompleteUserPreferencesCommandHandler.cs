using matcha.Application.Dtos.Users;
using matcha.Application.Exceptions;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Profile.Commands.CompleteUserPreferences
{
    public class CompleteUserPreferencesCommandHandler : IRequestHandler<CompleteUserPreferencesCommand, Response<UserProfileDto>>
    {
        private readonly IUserProfileService _userProfileService;
        private readonly IAuthenticatedUser _user;

        public CompleteUserPreferencesCommandHandler(IUserProfileService userProfileService, IAuthenticatedUser user)
        {
            _userProfileService = userProfileService;
            _user = user;
        }
        public async Task<Response<UserProfileDto>> Handle(CompleteUserPreferencesCommand request, CancellationToken cancellationToken)
        {
            ValidateRequest(request);
            return new Response<UserProfileDto>(await _userProfileService.CompleteUserPreferencesAsync(request));
        }
        private void ValidateRequest(CompleteUserPreferencesCommand request)
        {
            var errors = new Dictionary<string, string>();
            if (!request.UserInterestIds.Any())
                errors.Add(nameof(request.UserInterestIds), "At least you need to choose 1 interest");

            if (!request.Pictures.Any())
                errors.Add(nameof(request.Pictures), "At least you need to upload 1 picture");

            if (request.Pictures.Count() > 5)
                errors.Add(nameof(request.Pictures), "you are not able to upload more than 5 pictures");

            if (request.Gender == Domain.Common.Enums.Gender.Unknonw)
                errors.Add(nameof(request.Gender), "Your gender must be specified");

            if (errors.Any())
                throw new ValidationException("Validation errors occurs", errors);

        }
    }
}
