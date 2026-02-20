using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IMessageRepositoryAsync : IGenericRepoAsync<Message>
    {
        Task<IReadOnlyCollection<Message>> GetConversationMessagesAsync(Guid conversationId);
        Task MarkAsReadAsync(Guid conversationId, Guid userId);
    }
}
