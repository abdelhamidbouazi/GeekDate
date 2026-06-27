using sparkdates.Application.Dtos.RealtimeDtos;
using sparkdates.Domain.Common.Enums;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IRealtimeNotificationServiceAsync
    {
        Task SendMessageToConversationAsync(Guid conversationId, RealtimeMessageDto realtimeMessageDto);
        Task SendMessageUpdatedToConversationAsync(Guid conversationId, Guid messageId, string newText);
        Task SendMessageDeletedToConversationAsync(Guid conversationId, Guid messageId);
        Task SendNotificationToUserAsync(Guid userId, RealtimeNotificationDto realtimeNotificationDto);
        Task SendNotificationAsync(Guid toUserId, Guid fromUserId, NotificationType type, string message = "", Guid? conversationId = null);
    }
}
