using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Services
{
    public interface IConversationValidatorService
    {
        Task<Conversation> ValidateConversationExistsAsync(Guid conversationId);
    }
}
