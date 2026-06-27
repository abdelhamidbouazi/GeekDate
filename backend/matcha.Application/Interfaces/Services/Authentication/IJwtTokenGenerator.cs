using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Services.Authentication
{
    public interface IJwtTokenGenerator
    {
        string CreateToken(AppUser user);
        string GenerateRefreshToken();
    }
}
