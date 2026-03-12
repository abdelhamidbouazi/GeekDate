using matcha.Application.Dtos.ChatDtos;
using matcha.Application.Dtos.RealtimeDtos;
using matcha.Application.Exceptions;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.UoW;
using matcha.Application.ResponseWrappers;
using matcha.Domain.Common.Enums;

namespace matcha.DomainServices.Services.Message
{
    public class MessageServiceAsync : IMessageServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConversationValidatorService _conversationValidatorService;
        private readonly IMatchServiceAsync _matchServiceAsync;
        private readonly IRealtimeNotificationServiceAsync _notificationService;
        public MessageServiceAsync(IUnitOfWork unitOfWork, IConversationValidatorService conversationValidatorService, IMatchServiceAsync matchServiceAsync, IRealtimeNotificationServiceAsync notificationService)
        {
            _unitOfWork = unitOfWork;
            _conversationValidatorService = conversationValidatorService;
            _matchServiceAsync = matchServiceAsync;
            _notificationService = notificationService;
        }

        public async Task<Response<bool>> DeleteMessageAsync(Guid messageId, Guid userId)
        {
            var message = await _unitOfWork.GetRepository<IMessageRepositoryAsync>().FirstOrDefaultAsync(m => m.Id == messageId && m.SenderId == userId);

            if (message == null)
            {
                throw new NotFoundException("Message not found or you do not have permission to delete it.");
            }

            var conversationId = message.ConversationId;

            var success = await _unitOfWork.GetRepository<IMessageRepositoryAsync>().DeleteMessageAsync(messageId, userId);

            if (!success)
            {
                throw new Exception("Failed to delete the message. Please try again.");
            }

            // Broadcast deletion to conversation group
            await _notificationService.SendMessageDeletedToConversationAsync(conversationId, messageId);

            return new Response<bool>(true)
            {
                Message = "Message deleted successfully."
            };
        }

        public async Task<IReadOnlyCollection<Domain.Entities.Message>> GetConversationMessagesAsync(Guid conversationId)
        {
            var conversation = await _conversationValidatorService.ValidateConversationExistsAsync(conversationId);

            var messages = await _unitOfWork.GetRepository<IMessageRepositoryAsync>().GetConversationMessagesAsync(conversationId);

            return messages;
        }

        public async Task<Response<ConversationMessagesResponseDto>> GetConversationMessagesPagedAsync(
            Guid conversationId,
            int pageNumber = 1,
            int pageSize = 20)
        {
            await _conversationValidatorService.ValidateConversationExistsAsync(conversationId);

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var paginatedResult = await _unitOfWork.GetRepository<IMessageRepositoryAsync>()
                .GetConversationMessagesPagedAsync(conversationId, pageNumber, pageSize);

            var conversation = await _unitOfWork.GetRepository<IConversationRepositoryAsync>().FindAsync(conversationId);

            var isMatched = await _matchServiceAsync.AreUsersMatchedAsync(conversation.User1Id, conversation.User2Id);

            var responseDto = new ConversationMessagesResponseDto
            {
                Messages = paginatedResult,
                IsBlocked = !isMatched
            };
            return new Response<ConversationMessagesResponseDto>(responseDto)
            {
                Message = "Messages retrieved successfully.",
            };
        }

        public async Task<Response<int>> GetUnreadCountAsync(Guid conversationId, Guid userId)
        {
            await _conversationValidatorService.ValidateConversationExistsAsync(conversationId);

            var unreadCount = await _unitOfWork.GetRepository<IMessageRepositoryAsync>()
                .GetUnreadCountAsync(conversationId, userId);

            return new Response<int>(unreadCount)
            {
                Message = "Unread message count retrieved successfully."
            };
        }

        public async Task<Response<bool>> MarkAsReadAsync(Guid conversationId, Guid userId)
        {
            await _conversationValidatorService.ValidateConversationExistsAsync(conversationId);

            await _unitOfWork.CreateTransaction();

            await _unitOfWork.GetRepository<IMessageRepositoryAsync>()
                .MarkAsReadAsync(conversationId, userId);

            await _unitOfWork.CommitTransaction();

            return new Response<bool>(true)
            {
                Message = "Messages marked as read successfully."
            };
        }

        public async Task<Response<Domain.Entities.Message>> SendMessageAsync(Domain.Entities.Message message)
        {
            if (string.IsNullOrWhiteSpace(message.MessageText))
            {
                throw new ValidationException("Message content cannot be empty.");
            }

            var isMatched = await _matchServiceAsync.AreUsersMatchedAsync(message.SenderId, message.ReceiverId);

            if (!isMatched)
            {
                throw new ValidationException("You must be matched with this user to send messages.");
            }

            await _unitOfWork.CreateTransaction();

            var conversation = await _unitOfWork.GetRepository<IConversationRepositoryAsync>()
                .GetConversationBetweenUsersAsync(message.SenderId, message.ReceiverId);

            if (conversation == null)
            {
                conversation = new Domain.Entities.Conversation
                {
                    Id = Guid.NewGuid(),
                    User1Id = message.SenderId,
                    User2Id = message.ReceiverId,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.GetRepository<IConversationRepositoryAsync>().AddAsync(conversation);

            }

            message.Id = Guid.NewGuid();
            message.ConversationId = conversation.Id;
            message.SentAt = DateTime.UtcNow;
            message.IsRead = false;
            //message.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.GetRepository<IMessageRepositoryAsync>().AddAsync(message);

            await _unitOfWork.CommitTransaction();

            // Push real-time message to the conversation group
            await _notificationService.SendMessageToConversationAsync(conversation.Id, new RealtimeMessageDto
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                MessageText = message.MessageText,
                SentAt = message.SentAt,
                IsRead = message.IsRead,
            });

            // Notify receiver
            await _notificationService.SendNotificationAsync(message.ReceiverId, message.SenderId, NotificationType.Message, "", conversation.Id);

            return new Response<Domain.Entities.Message>(message)
            {
                Message = "Message sent successfully."
            };
        }

        public async Task<Response<bool>> UpdateMessageAsync(Guid messageId, Guid userId, string newContent)
        {
            if (string.IsNullOrWhiteSpace(newContent))
            {
                throw new ValidationException("Message content cannot be empty.");
            }

            var message = await _unitOfWork.GetRepository<IMessageRepositoryAsync>().FirstOrDefaultAsync(m => m.Id == messageId && m.SenderId == userId);

            if (message == null)
            {
                throw new NotFoundException("Message not found or you do not have permission to update it.");
            }

            var success = await _unitOfWork.GetRepository<IMessageRepositoryAsync>().UpdateMessageAsync(messageId, userId, newContent);

            if (!success)
            {
                throw new Exception("Failed to update the message. Please try again.");
            }

            // Broadcast update to conversation group
            await _notificationService.SendMessageUpdatedToConversationAsync(message.ConversationId, messageId, newContent);

            return new Response<bool>(true)
            {
                Message = "Message updated successfully."
            };
        }
    }
}
