using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IConversationValidatorService
    {
        Task<Conversation> ValidateConversationExistsAsync(Guid conversationId);
    }
}
