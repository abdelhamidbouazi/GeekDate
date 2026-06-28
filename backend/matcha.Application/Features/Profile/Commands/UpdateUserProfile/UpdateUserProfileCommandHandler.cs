using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Exceptions;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Profile.Commands.UpdateUserProfile
{
    public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, Response<UserProfileDto>>
    {
        private readonly IUserProfileService _userProfileService;
        private readonly IAuthenticatedUser _authenticatedUser;

        public UpdateUserProfileCommandHandler(IUserProfileService userProfileService, IAuthenticatedUser authenticatedUser)
        {
            _userProfileService = userProfileService;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<UserProfileDto>> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            if (request is null)
                throw new ValidationException("Validation errors occurs", new Dictionary<string, string>
                {
                    { nameof(request), "Profile update payload is required" }
                });

            ValidateRequest(request);
            request.UserId = _authenticatedUser.UserId;
            var result = await _userProfileService.UpdateUserProfileAsync(request, _authenticatedUser.UserId);

            return new Response<UserProfileDto>(await _userProfileService.GetUserProfile(_authenticatedUser.UserId));
        }

        private void ValidateRequest(UpdateUserProfileCommand request)
        {
            var errors = new Dictionary<string, string>();
            if (request.UserInterestIds is null || !request.UserInterestIds.Any())
                errors.Add(nameof(request.UserInterestIds), "At least you need to choose 1 interest");

            if (request.Gender == Domain.Common.Enums.Gender.Unknown)
                errors.Add(nameof(request.Gender), "Your gender must be specified");

            if (request.SexualPreferences == Domain.Common.Enums.SexualPreferences.None || request.SexualPreferences == Domain.Common.Enums.SexualPreferences.Unknown)
                errors.Add(nameof(request.SexualPreferences), "Your sexual preference must be specified");

            if (string.IsNullOrEmpty(request.FirstName))
                errors.Add(nameof(request.FirstName), $"{nameof(request.FirstName)} is required");

            if (string.IsNullOrEmpty(request.LastName))
                errors.Add(nameof(request.LastName), $"{nameof(request.LastName)} is required");

            if (string.IsNullOrEmpty(request.Email))
                errors.Add(nameof(request.Email), $"{nameof(request.Email)} is required");

            if (errors.Any())
                throw new ValidationException("Validation errors occurs", errors);

        }
    }
}
