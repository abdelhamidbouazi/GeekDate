using matcha.Application.Dtos.Common;
using matcha.Application.ResponseWrappers;
using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Services
{
    public interface IMessageServiceAsync
    {

        Task<IReadOnlyCollection<Message>> GetConversationMessagesAsync(Guid conversationId);

        Task<Response<PaginatedResult<Message>>> GetConversationMessagesPagedAsync(Guid conversationId, int pageNumber, int pageSize);
        Task<Response<Message>> SendMessageAsync(Message message);
        Task<Response<bool>> UpdateMessageAsync(Guid messageId, Guid userId, string newContent);
        Task<Response<bool>> DeleteMessageAsync(Guid messageId, Guid userId);

        Task<Response<bool>> MarkAsReadAsync(Guid conversationId, Guid userId);

        Task<Response<int>> GetUnreadCountAsync(Guid conversationId, Guid userId);

    }
}
