using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace matcha.Infrastructure.Hubs
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? connection.User?.FindFirst("nameid")?.Value
                ?? connection.User?.FindFirst("user_id")?.Value
                ?? connection.User?.FindFirst("sub")?.Value;
        }
    }
}
