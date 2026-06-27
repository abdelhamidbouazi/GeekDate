using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Commands.DeleteUserInterest
{
    public class DeleteUserInterestCommandHandler : IRequestHandler<DeleteUserInterestCommand, Response<bool>>
    {
        private readonly IUserInterestsService _userInterestsService;

        public DeleteUserInterestCommandHandler(IUserInterestsService userInterestsService)
        {
            _userInterestsService = userInterestsService;
        }

        public async Task<Response<bool>> Handle(DeleteUserInterestCommand request, CancellationToken cancellationToken)
        {
            var result = await _userInterestsService.Delete(request.Id);

            return new Response<bool>(result);
        }
    }
}
