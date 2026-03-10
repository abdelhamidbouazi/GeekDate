using matcha.Application.Dtos.ChatDtos;
using matcha.Application.Dtos.Common;
using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using matcha.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace matcha.API.Controllers
{
    public class ChatController : BaseApiController
    {
        private readonly IMessageServiceAsync _messageServiceAsync;

        public ChatController(IMessageServiceAsync messageServiceAsync)
        {
            _messageServiceAsync = messageServiceAsync;
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<ActionResult<Response<PaginatedResult<Message>>>> GetConversationMessages(
                [FromRoute] Guid conversationId,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 20)
        {

            var result = await _messageServiceAsync.GetConversationMessagesPagedAsync(conversationId, pageNumber, pageSize);

            if (!result.IsSucceeded)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("send-message")]
        public async Task<ActionResult<Response<Message>>> SendMessage(
            [FromBody] SendMessageDto dto)
        {
            var userId = GetCurrentUserId();

            var message = new Message
            {
                SenderId = userId,
                ReceiverId = dto.ReceiverId,
                MessageText = dto.MessageText
            };

            var result = await _messageServiceAsync.SendMessageAsync(message);

            if (!result.IsSucceeded)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("messages/{messageId}")]
        public async Task<ActionResult<Response<bool>>> UpdateMessage(
            [FromRoute] Guid messageId,
            [FromBody] UpdateMessageDto dto)
        {
            var userId = GetCurrentUserId();

            var result = await _messageServiceAsync.UpdateMessageAsync(
                messageId,
                userId,
                dto.MessageText
            );

            if (!result.IsSucceeded)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpDelete("messages/{messageId}")]
        public async Task<ActionResult<Response<bool>>> DeleteMessage(
           [FromRoute] Guid messageId)
        {
            var userId = GetCurrentUserId();

            var result = await _messageServiceAsync.DeleteMessageAsync(messageId, userId);

            if (!result.IsSucceeded)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("conversations/{conversationId}/mark-read")]
        public async Task<ActionResult<Response<bool>>> MarkAsRead(
            [FromRoute] Guid conversationId)
        {
            var userId = GetCurrentUserId();

            var result = await _messageServiceAsync.MarkAsReadAsync(conversationId, userId);

            if (!result.IsSucceeded)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet("conversations/{conversationId}/unread-count")]
        public async Task<ActionResult<Response<int>>> GetUnreadCount(
            [FromRoute] Guid conversationId)
        {
            var userId = GetCurrentUserId();

            var result = await _messageServiceAsync.GetUnreadCountAsync(conversationId, userId);

            if (!result.IsSucceeded)
                return BadRequest(result);

            return Ok(result);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("UserId")?.Value
                           ?? User.FindFirst("sub")?.Value
                           ?? User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found in token");

            return Guid.Parse(userIdClaim);
        }

    }
}
