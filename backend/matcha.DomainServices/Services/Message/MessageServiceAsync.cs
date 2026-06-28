using sparkdates.Application.Dtos.Common;
using sparkdates.Application.Dtos.RealtimeDtos;
using sparkdates.Application.Exceptions;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.Interfaces.UoW;
using sparkdates.Application.ResponseWrappers;
using sparkdates.Domain.Common.Enums;

namespace sparkdates.DomainServices.Services.Message
{
    public class MessageServiceAsync : IMessageServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConversationValidatorService _conversationValidatorService;
        private readonly IMatchServiceAsync _matchServiceAsync;
        private readonly IRealtimeNotificationServiceAsync _notificationService;
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IBlockGuardServiceAsync _blockGuardServiceAsync;
        public MessageServiceAsync(
            IUnitOfWork unitOfWork,
            IConversationValidatorService conversationValidatorService,
            IMatchServiceAsync matchServiceAsync,
            IRealtimeNotificationServiceAsync notificationService,
            IAuthenticatedUser authenticatedUser,
            IBlockGuardServiceAsync blockGuardServiceAsync)
        {
            _unitOfWork = unitOfWork;
            _conversationValidatorService = conversationValidatorService;
            _matchServiceAsync = matchServiceAsync;
            _notificationService = notificationService;
            _authenticatedUser = authenticatedUser;
            _blockGuardServiceAsync = blockGuardServiceAsync;
        }

        // Read-only access — participants can always view history even after a block.
        private async Task<Domain.Entities.Conversation> GetReadableConversationAsync(Guid conversationId)
        {
            var conversation = await _conversationValidatorService.ValidateConversationExistsAsync(conversationId);
            var currentUserId = _authenticatedUser.UserId;

            if (conversation.User1Id != currentUserId && conversation.User2Id != currentUserId)
                throw new ForbiddenException("You cannot access this conversation.");

            return conversation;
        }

        // Write access — also enforces the block guard (can't send/edit/delete when blocked).
        private async Task<Domain.Entities.Conversation> GetAccessibleConversationAsync(Guid conversationId)
        {
            var conversation = await GetReadableConversationAsync(conversationId);
            var currentUserId = _authenticatedUser.UserId;
            var otherUserId = conversation.User1Id == currentUserId ? conversation.User2Id : conversation.User1Id;

            await _blockGuardServiceAsync.EnsureUsersCanInteractAsync(
                currentUserId,
                otherUserId,
                "This conversation is unavailable.");

            return conversation;
        }

        public async Task<Response<bool>> DeleteMessageAsync(Guid messageId, Guid userId)
        {
            var message = await _unitOfWork.GetRepository<IMessageRepositoryAsync>().FirstOrDefaultAsync(m => m.Id == messageId && m.SenderId == userId);

            if (message == null)
            {
                throw new NotFoundException("Message not found or you do not have permission to delete it.");
            }

            await _blockGuardServiceAsync.EnsureUsersCanInteractAsync(
                message.SenderId,
                message.ReceiverId,
                "This conversation is unavailable.");

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
            await GetReadableConversationAsync(conversationId);

            var messages = await _unitOfWork.GetRepository<IMessageRepositoryAsync>().GetConversationMessagesAsync(conversationId);

            return messages;
        }

        public async Task<Response<PaginatedResult<Domain.Entities.Message>>> GetConversationMessagesPagedAsync(
            Guid conversationId,
            int pageNumber = 1,
            int pageSize = 20)
        {
            var conversation = await GetReadableConversationAsync(conversationId);
            var currentUserId = _authenticatedUser.UserId;
            var otherUserId = conversation.User1Id == currentUserId ? conversation.User2Id : conversation.User1Id;

            // Tell the UI whether sending is blocked so it can disable the input immediately
            var isBlocked = await _blockGuardServiceAsync.IsBlockedBetweenUsersAsync(currentUserId, otherUserId);
            var isMatched = await _matchServiceAsync.AreUsersMatchedAsync(currentUserId, otherUserId);

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var paginatedResult = await _unitOfWork.GetRepository<IMessageRepositoryAsync>()
                .GetConversationMessagesPagedAsync(conversationId, pageNumber, pageSize);

            return new Response<PaginatedResult<Domain.Entities.Message>>(paginatedResult)
            {
                Message = "Messages retrieved successfully.",
                IsBlocked = isBlocked || !isMatched,
            };
        }

        public async Task<Response<int>> GetUnreadCountAsync(Guid conversationId, Guid userId)
        {
            await GetReadableConversationAsync(conversationId);

            var unreadCount = await _unitOfWork.GetRepository<IMessageRepositoryAsync>()
                .GetUnreadCountAsync(conversationId, userId);

            return new Response<int>(unreadCount)
            {
                Message = "Unread message count retrieved successfully."
            };
        }

        public async Task<Response<bool>> MarkAsReadAsync(Guid conversationId, Guid userId)
        {
            await GetReadableConversationAsync(conversationId);

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

            await _blockGuardServiceAsync.EnsureUsersCanInteractAsync(
                message.SenderId,
                message.ReceiverId,
                "This conversation is unavailable.");

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

            await _blockGuardServiceAsync.EnsureUsersCanInteractAsync(
                message.SenderId,
                message.ReceiverId,
                "This conversation is unavailable.");

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
