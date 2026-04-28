using matcha.Application.Dtos.RealtimeDtos;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.UoW;
using matcha.Domain.Common.Enums;
using matcha.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace matcha.Infrastructure.Services.RealtimeNotification
{
    public class SignalRNotificationService : IRealtimeNotificationServiceAsync
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IUnitOfWork _unitOfWork;
        public SignalRNotificationService(IHubContext<ChatHub> hubContext, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        }
        public async Task SendMessageToConversationAsync(Guid conversationId, RealtimeMessageDto realtimeMessageDto)
        {
            await _hubContext.Clients
                 .Group($"conv-{conversationId}")
                 .SendAsync("ReceiveMessage", realtimeMessageDto);
        }

        public async Task SendMessageUpdatedToConversationAsync(Guid conversationId, Guid messageId, string newText)
        {
            await _hubContext.Clients
                 .Group($"conv-{conversationId}")
                 .SendAsync("MessageUpdated", new { messageId = messageId.ToString(), messageText = newText, conversationId = conversationId.ToString() });
        }

        public async Task SendMessageDeletedToConversationAsync(Guid conversationId, Guid messageId)
        {
            await _hubContext.Clients
                 .Group($"conv-{conversationId}")
                 .SendAsync("MessageDeleted", new { messageId = messageId.ToString(), conversationId = conversationId.ToString() });
        }

        public async Task SendNotificationAsync(Guid toUserId, Guid fromUserId, NotificationType type, string message = "", Guid? conversationId = null)
        {
            var notification = new matcha.Domain.Entities.Notification
            {
                Id = Guid.NewGuid(),
                UserId = toUserId,
                FromUserId = fromUserId,
                Type = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.GetRepository<INotificationRepositoryAsync>().AddAsync(notification);

            await _unitOfWork.CommitTransaction();

            var sender = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FindAsync(fromUserId);
            var senderName = sender != null ? $"{sender.FirstName} {sender.LastName}" : "Someone";

            if (string.IsNullOrEmpty(message))
            {
                message = GetNotificationMessage(type, senderName);
            }

            await _hubContext.Clients
                .User(toUserId.ToString())
                .SendAsync("ReceiveNotification", new RealtimeNotificationDto
                {
                    FromUser = fromUserId,
                    Type = type,
                    Message = message,
                    ConversationId = conversationId,
                    Timestamp = DateTime.UtcNow
                });
        }

        private string GetNotificationMessage(NotificationType type, string senderName)
        {
            return type switch
            {
                NotificationType.Like => $"{senderName} liked you ❤️",
                NotificationType.ProfileVisit => $"{senderName} viewed your profile 👀",
                NotificationType.Message => $"New message from {senderName} 💬",
                NotificationType.Match => $"You matched with {senderName}! 🎉",
                NotificationType.Unlike => $"{senderName} unliked you 💔",
                _ => "New notification"
            };
        }
        public async Task SendNotificationToUserAsync(Guid userId, RealtimeNotificationDto realtimeNotificationDto)
        {
            File.AppendAllText("C:\\temp\\signalr-log.txt",
                $"[{DateTime.Now}] Sending notification to userId: {userId}\n");

            await _hubContext.Clients
                 .User(userId.ToString())
                 .SendAsync("ReceiveNotification", realtimeNotificationDto);
        }
    }
}
