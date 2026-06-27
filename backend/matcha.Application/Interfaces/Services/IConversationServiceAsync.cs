using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IConversationServiceAsync
    {
        Task<IReadOnlyCollection<Conversation>> GetUserConversationsAsync(Guid userId);
        Task<Conversation> GetConversationBetweenUsersAsync(Guid user1Id, Guid user2Id);
        Task<Conversation> CreateConversationWithUserAsync(Guid userId);
        Task<bool> DeleteConversationAsync(Guid conversationId);
        Task<Conversation> GetOrCreateConversationAsync(Guid userId);
    }
}
