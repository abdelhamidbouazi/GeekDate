using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using matcha.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace matcha.API.Controllers
{
    [Authorize]
    public class ConversationController : BaseApiController
    {
        private readonly IConversationServiceAsync _conversationServiceAsync;
        private readonly IAuthenticatedUser _authenticatedUser;
        public ConversationController(IConversationServiceAsync conversationServiceAsync, IAuthenticatedUser authenticatedUser)
        {
            _conversationServiceAsync = conversationServiceAsync;
            _authenticatedUser = authenticatedUser;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUserConversations()
        {
            var userId = _authenticatedUser.UserId;
            var conversations = await _conversationServiceAsync.GetUserConversationsAsync(userId);

            return Ok(new Response<IReadOnlyCollection<Conversation>>(conversations));
        }

        [HttpGet("with/{userId}")]
        public async Task<ActionResult<Conversation>> GetConversationWithUser(Guid userId)
        {
            var currentUser = await _authenticatedUser.GetAuthenticatedAsync();

            if (currentUser == null)
                return Unauthorized();

            var conversation = await _conversationServiceAsync.GetConversationBetweenUsersAsync(currentUser.Id, userId);

            if (conversation.User1Id != currentUser.Id)
                return Forbid();

            return Ok(conversation);
        }

        [HttpPost("with/{userId}")]
        public async Task<ActionResult<Conversation>> CreateConversationWithUser(Guid userId)
        {
            var currentUser = await _authenticatedUser.GetAuthenticatedAsync();

            if (currentUser == null)
                return Unauthorized();

            var conversation = await _conversationServiceAsync.CreateConversationWithUserAsync(userId);

            return CreatedAtAction(nameof(GetConversationWithUser), new { userId = userId }, conversation);
        }

        [HttpDelete("{conversationId}")]
        public async Task<IActionResult> DeleteConversation(Guid conversationId)
        {
            var currentUserId = await _authenticatedUser.GetAuthenticatedAsync();

            if (currentUserId == null)
                return Unauthorized();

            var result = await _conversationServiceAsync.DeleteConversationAsync(conversationId);

            if (!result)
                return NotFound();

            return NoContent();
        }

    }
}
