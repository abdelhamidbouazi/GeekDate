using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Commands.UpdateUserInterest
{
    public class UpdateUserInterestCommandHandler : IRequestHandler<UpdateUserInterestCommand, Response<UserInterestDto>>
    {
        private readonly IUserInterestsService _userInterestsService;

        public UpdateUserInterestCommandHandler(IUserInterestsService userInterestsService)
        {
            _userInterestsService = userInterestsService;
        }

        public async Task<Response<UserInterestDto>> Handle(UpdateUserInterestCommand request, CancellationToken cancellationToken)
        {
            var result = await _userInterestsService.UpdateUserInterestAsync(request.id, request.UpdateUserInterestDto);

            return new Response<UserInterestDto>(result);
        }
    }
}
