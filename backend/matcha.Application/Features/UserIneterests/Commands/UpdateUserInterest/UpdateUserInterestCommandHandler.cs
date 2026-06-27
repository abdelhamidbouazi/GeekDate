using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Commands.UpdateUserInterest
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
