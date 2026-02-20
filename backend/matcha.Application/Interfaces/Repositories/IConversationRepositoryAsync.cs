using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IConversationRepositoryAsync : IGenericRepoAsync<Conversation>
    {
        Task<Conversation> GetConversationBetweenUsersAsync(Guid user1Id, Guid user2Id);
    }
}
