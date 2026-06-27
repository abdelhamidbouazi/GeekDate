using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Repositories
{
    public interface IConversationRepositoryAsync : IGenericRepoAsync<Conversation>
    {
        Task<Conversation> GetConversationBetweenUsersAsync(Guid user1Id, Guid user2Id);
        Task<IReadOnlyCollection<Conversation>> GetUserConversationsWithUnreadCountAsync(Guid userId);
    }
}
