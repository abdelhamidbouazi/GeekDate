using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Interests.Commands.DeleteInterest
{
    public class DeleteInterestCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
    }
}
