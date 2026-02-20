using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Services
{
    public interface IConversationServiceAsync
    {
        Task<Conversation> GetConversationBetweenUsersAsync(Guid user1Id, Guid user2Id);
        Task<Conversation> CreateConversationWithUserAsync(Guid userId);
        Task<bool> DeleteConversationAsync(Guid conversationId);
    }
}
