using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Domain.Entities;
using System.Security.Claims;

namespace sparkdates.API.Authentication
{
    public class AuthenticatedUser : IAuthenticatedUser
    {
        private readonly IServiceProvider _serviceProvider;

        public Guid UserId { get; private set; }
        private AppUser _currentUser;
        public bool Authenticated => UserId != Guid.Empty;

        public AuthenticatedUser(IHttpContextAccessor httpContext, IServiceProvider serviceProvider)
        {
            var userIdClaim = httpContext.HttpContext?.User.FindFirstValue("user_id");

            if (Guid.TryParse(userIdClaim, out var userId))
                UserId = userId;

            this._serviceProvider = serviceProvider;
        }
        public async Task<AppUser> GetAuthenticatedAsync()
        {
            if (!Authenticated)
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }
            using var scope = _serviceProvider.CreateScope();
            var userService = scope.ServiceProvider.GetService<IUserServiceAsync>();
            return await userService!.GetUserByIdAsync(UserId);
        }
    }
}
