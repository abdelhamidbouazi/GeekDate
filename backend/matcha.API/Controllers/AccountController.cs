using matcha.Application.Dtos.AccountDtos;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.ResponseWrappers;
using matcha.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace matcha.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var user = await _accountService.RegisterAsync(registerDto);

            if (user == null) BadRequest(new Response<AppUser>("Registring user has not been succeeded", false));

            return Ok(new Response<LoginDto>(user) { Message = "Email Verification sent" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var user = await _accountService.LoginAsync(request);

            if (user == null) BadRequest(new Response<AppUser>("login user has been failed", false));

            return Ok(new Response<LoginResponseDto>(user));
        }

        [HttpGet("verify")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] Guid userId, [FromQuery] string token)
        {
            await _accountService.ConfirmEmailAsync(userId, token);

            return Ok(new Response<string>("Account verified"));
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> SendResetPasswordEmail([FromBody] string email)
        {
            await _accountService.SendResetPasswordEmail(email);

            return Ok(new Response<string>("Password reset email sent"));
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ForgetPasswordDto requestData)
        {

            var success = await _accountService.ResetPasswordAsync(requestData.UserId, requestData.Token, requestData.NewPassword);

            if (!success) return BadRequest(new Response<string>("Password reset was failed, please try again, with onether link.", false));

            return Ok(new Response<string>("password updated"));
        }

        [HttpGet("validate-token")]
        public async Task<IActionResult> ValidateToken()
        {
            var result = await _accountService.ValidateToken(User);

            if (!result.IsValid)
            {
                return Unauthorized(new { message = result.Message });
            }

            return Ok(new
            {
                message = result.Message,
                emailVerified = result.EmailVerified,
                profileCompleted = result.ProfileCompleted
            });
        }

        [Authorize]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> GenerateAccessToken([FromBody] string refreshToken)
        {
            var result = await _accountService.GenerateNewAccessToken(refreshToken);

            if (result is null)
                return Unauthorized(new { message = "Invalid or expired refresh token." });

            return Ok(new Response<string>(result));
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> GenerateAccessToken()
        {
            await _accountService.LogOut();

            return Ok(new Response<string>("logged out"));
        }

    }
}
