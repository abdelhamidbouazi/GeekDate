using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Services.Authentication
{
    public interface IAuthenticatedUser
    {
        Guid UserId { get; }
        bool Authenticated { get; }
        Task<AppUser> GetAuthenticatedAsync();
    }
}
