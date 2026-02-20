using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Services.Authentication
{
    public interface IAuthenticatedUser
    {
        Guid UserId { get; }
        bool Authenticated { get; }
        Task<AppUser> GetAuthenticatedAsync();
    }
}
