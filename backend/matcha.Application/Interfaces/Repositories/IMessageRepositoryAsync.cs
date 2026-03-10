using matcha.Application.Dtos.Common;
using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IMessageRepositoryAsync : IGenericRepoAsync<Message>
    {
        Task<IReadOnlyCollection<Message>> GetConversationMessagesAsync(Guid conversationId);
        Task<PaginatedResult<Message>> GetConversationMessagesPagedAsync(
            Guid conversationId,
            int pageNumber,
            int pageSize);
        Task MarkAsReadAsync(Guid conversationId, Guid userId);
        Task<int> GetUnreadCountAsync(Guid conversationId, Guid userId);

        Task<bool> UpdateMessageAsync(Guid messageId, Guid userId, string newContent);
        Task<bool> DeleteMessageAsync(Guid messageId, Guid userId);

    }
}
