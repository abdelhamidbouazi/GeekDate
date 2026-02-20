using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Commands.CreateUserInterest
{
    public class CreateUserInterestCommandHandler : IRequestHandler<CreateUserInterestCommand, Response<UserInterestDto>>
    {
        private readonly IUserInterestsService _userInterestsService;

        public CreateUserInterestCommandHandler(IUserInterestsService userInterestsService)
        {
            _userInterestsService = userInterestsService;
        }

        public async Task<Response<UserInterestDto>> Handle(CreateUserInterestCommand request, CancellationToken cancellationToken)
        {
            var userInterest = await _userInterestsService.CreateUserInterestAsync(request.CreateUserInterestDto);

            return new Response<UserInterestDto>(userInterest);
        }
    }
}
