using sparkdates.Domain.Common.Enums;

namespace sparkdates.Application.Dtos.RealtimeDtos
{
    public class RealtimeNotificationDto
    {
        public NotificationType Type { get; set; }
        public Guid FromUser { get; set; }
        public Guid? ConversationId { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    }
}
