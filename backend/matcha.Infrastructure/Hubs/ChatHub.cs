using matcha.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;

namespace matcha.Infrastructure.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public ChatHub(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            if (userId != Guid.Empty)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");

                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var presenceService = scope.ServiceProvider
                        .GetRequiredService<IUserPresenceServiceAsync>();
                    await presenceService.UpdateLastActiveAsync(userId);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ [Hub] UpdateLastActive failed: {ex.Message}");
                }

                // Notify all other connected clients that this user is online
                await Clients.Others.SendAsync("UserOnline", new { userId = userId.ToString() });

                Console.WriteLine($"✅ User {userId} connected ({Context.ConnectionId})");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetCurrentUserId();
            if (userId != Guid.Empty)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var presenceService = scope.ServiceProvider
                        .GetRequiredService<IUserPresenceServiceAsync>();
                    await presenceService.UpdateLastActiveAsync(userId);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ [Hub] UpdateLastActive failed on disconnect: {ex.Message}");
                }

                // Notify all other connected clients that this user is offline
                await Clients.Others.SendAsync("UserOffline", new { userId = userId.ToString() });
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinConversation(Guid conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"conv-{conversationId}");
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conv-{conversationId}");
        }

        public async Task UserTyping(Guid conversationId)
        {
            var userId = GetCurrentUserId();
            if (userId != Guid.Empty)
            {
                await Clients.GroupExcept($"conv-{conversationId}", Context.ConnectionId)
                    .SendAsync("UserTyping", new
                    {
                        userId = userId.ToString(),
                        conversationId = conversationId.ToString()
                    });
            }
        }
        public async Task UserStoppedTyping(Guid conversationId)
        {
            var userId = GetCurrentUserId();
            await Clients.GroupExcept($"conv-{conversationId}", Context.ConnectionId)
                .SendAsync("UserStoppedTyping", new
                {
                    userId = userId.ToString(),
                    conversationId = conversationId.ToString()
                });
        }

        //public async Task MarkMessagesAsRead(Guid conversationId)
        //{
        //    var userId = GetCurrentUserId();
        //    if (userId != Guid.Empty)
        //    {
        //        await Clients.Group($"conv-{conversationId}")
        //            .SendAsync("MessagesRead", new
        //            {
        //                userId = userId.ToString(),
        //                conversationId = conversationId.ToString(),
        //                readAt = DateTime.UtcNow
        //            });
        //    }
        //}
        private Guid GetCurrentUserId()
        {
            // ✅ AJOUTÉ: "user_id" en premier (ton JWT utilise ce claim!)
            var userIdClaim = Context.User?.FindFirst("user_id")?.Value
                    ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? Context.User?.FindFirst("UserId")?.Value
                    ?? Context.User?.FindFirst("sub")?.Value
                    ?? Context.User?.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                Console.WriteLine($"⚠️ [Hub] No user ID claim found!");
                return Guid.Empty;
            }

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                Console.WriteLine($"✅ [Hub] User ID found: {userId}");
                return userId;
            }

            Console.WriteLine($"⚠️ [Hub] Invalid user ID format: {userIdClaim}");
            return Guid.Empty;
        }
    }
}
