using matcha.Application.Dtos.RealtimeDtos;
using matcha.Domain.Common.Enums;

namespace matcha.Application.Interfaces.Services
{
    public interface IRealtimeNotificationServiceAsync
    {
        Task SendMessageToConversationAsync(Guid conversationId, RealtimeMessageDto realtimeMessageDto);
        Task SendNotificationToUserAsync(Guid userId, RealtimeNotificationDto realtimeNotificationDto);
        Task SendNotificationAsync(Guid toUserId, Guid fromUserId, NotificationType type, string message = "", Guid? conversationId = null);
    }
}
