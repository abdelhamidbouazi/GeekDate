using sparkdates.Application.Dtos.AccountDtos;
using sparkdates.Application.ResponseWrappers;
using System.Security.Claims;

namespace sparkdates.Application.Interfaces.Services.Authentication
{
    public interface IAccountService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<LoginDto> RegisterAsync(RegisterDto registerDto);
        Task SendConfirmationEmail(Guid userId);
        Task ConfirmEmailAsync(Guid userId, string token);
        Task SendResetPasswordEmail(string email);
        Task<bool> ResetPasswordAsync(Guid userId, string token, string newPassword);
        //Task<Response<TokenValidationResult>> ValidateToken(string token);
        Task<TokenValidationResult> ValidateToken(ClaimsPrincipal user);
        Task<string> GenerateNewAccessToken(string refreshToken);

        Task LogOut();

    }
}
