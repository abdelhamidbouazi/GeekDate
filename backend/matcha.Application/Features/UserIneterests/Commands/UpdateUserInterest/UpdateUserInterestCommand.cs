using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.UserIneterests.Commands.UpdateUserInterest
{
    public class UpdateUserInterestCommand : IRequest<Response<UserInterestDto>>
    {
        public Guid id { get; set; }
        public UpdateUserInterestDto UpdateUserInterestDto { get; set; }
    }
}
