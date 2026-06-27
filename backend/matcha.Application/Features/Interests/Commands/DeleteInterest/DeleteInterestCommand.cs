using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Interests.Commands.DeleteInterest
{
    public class DeleteInterestCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
    }
}
