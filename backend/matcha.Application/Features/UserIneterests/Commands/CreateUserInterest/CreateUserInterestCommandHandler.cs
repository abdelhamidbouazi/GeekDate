using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Commands.CreateUserInterest
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
