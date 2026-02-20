using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Services.Authentication
{
    public interface IJwtTokenGenerator
    {
        string CreateToken(AppUser user);
        string GenerateRefreshToken();
    }
}
