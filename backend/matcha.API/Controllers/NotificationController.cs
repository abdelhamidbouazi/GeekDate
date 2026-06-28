using sparkdates.Application.Interfaces.Services.Notification;
using sparkdates.Application.ResponseWrappers;
using sparkdates.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace sparkdates.API.Controllers
{
    [Authorize]
    public class NotificationController : BaseApiController
    {
        private readonly INotificationServiceAsync _notificationServiceAsync;

        public NotificationController(INotificationServiceAsync notificationServiceAsync)
        {
            _notificationServiceAsync = notificationServiceAsync;
        }

        [HttpGet]
        public async Task<ActionResult> GetAllNotifications()
        {
            var userId = GetCurrentUserId();
            var result = await _notificationServiceAsync.GetAllNotificationsAsync(userId);
            return Ok(new Response<IReadOnlyCollection<Notification>>(result));
        }

        [HttpGet("unread")]
        public async Task<ActionResult> GetUnreadNotifications()
        {
            var userId = GetCurrentUserId();
            var result = await _notificationServiceAsync.GetUnreadNotifications(userId);
            return Ok(new Response<IReadOnlyCollection<Notification>>(result));
        }

        [HttpGet("unread-count")]
        public async Task<ActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            var count = await _notificationServiceAsync.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        [HttpPut("mark-read")]
        public async Task<ActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            await _notificationServiceAsync.MarkAllAsReadAsync(userId);
            return Ok();
        }

        [HttpPut("{id:Guid}/read")]
        public async Task<ActionResult> MarkOneAsRead(Guid id)
        {
            var userId = GetCurrentUserId();
            await _notificationServiceAsync.MarkAsReadAsync(userId, id);
            return NoContent();
        }

        [HttpDelete("{id:Guid}")]
        public async Task<ActionResult> DeleteNotification(Guid id)
        {
            var userId = GetCurrentUserId();
            await _notificationServiceAsync.DeleteNotificationAsync(userId, id);
            return NoContent();
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("UserId")?.Value
                           ?? User.FindFirst("sub")?.Value
                           ?? User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found in token");

            return Guid.Parse(userIdClaim);
        }
    }
}
