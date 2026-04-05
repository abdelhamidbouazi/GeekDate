using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.Interfaces.UoW;
using matcha.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Security.Cryptography;
using System.Text;

namespace matcha.API.Controllers
{
    [Route("api/dev")]
    [ApiController]
    public class DevAuthController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public DevAuthController(
            IWebHostEnvironment env,
            IConfiguration configuration,
            IUnitOfWork unitOfWork,
            IJwtTokenGenerator jwtTokenGenerator)
        {
            _env = env;
            _configuration = configuration;
            _unitOfWork = unitOfWork;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public sealed class ImpersonateRequest
        {
            public string Identifier { get; set; } = "";
        }

        [HttpPost("impersonate")]
        public async Task<IActionResult> Impersonate([FromBody] ImpersonateRequest request)
        {
            if (!_env.IsDevelopment())
                return NotFound();

            var expectedSecret = _configuration["DEV_IMPERSONATE_SECRET"];
            var providedSecret = Request.Headers["X-Dev-Secret"].ToString();
            if (string.IsNullOrWhiteSpace(expectedSecret) || !string.Equals(expectedSecret, providedSecret, StringComparison.Ordinal))
                return Unauthorized(new { message = "Unauthorized" });

            var identifier = request?.Identifier?.Trim();
            if (string.IsNullOrWhiteSpace(identifier))
                return BadRequest(new { message = "Identifier is required" });

            var userRepo = _unitOfWork.GetRepository<IUserRepositoryAsync>();
            AppUser? user;
            if (identifier.Contains('@'))
                user = await userRepo.FirstOrDefaultAsync(u => u.Email == identifier);
            else
                user = await userRepo.FirstOrDefaultAsync(u => u.UserName == identifier);

            if (user is null)
                return NotFound(new { message = "User not found" });

            var accessToken = _jwtTokenGenerator.CreateToken(user);

            var (rawResetToken, resetUrl) = await CreateResetPasswordLinkAsync(user.Id);

            return Ok(new
            {
                userId = user.Id,
                userName = user.UserName,
                email = user.Email,
                token = accessToken,
                resetPasswordUrl = resetUrl,
                // Intentionally not returning rawResetToken in case you want to only use the URL.
            });
        }

        private async Task<(string RawToken, string Url)> CreateResetPasswordLinkAsync(Guid userId)
        {
            // Mirror AccountService behavior: store RAW token, URL contains Base64Url encoded token.
            var token = RandomTokenString();

            var resetPasswordToken = new ResetPassword
            {
                UserId = userId,
                Token = token,
                Expired = false,
                ExpiryDate = DateTime.UtcNow.AddHours(1)
            };

            await _unitOfWork.GetRepository<IResetPasswordRepositoryAsync>().AddAsync(resetPasswordToken);
            await _unitOfWork.CompleteAsync();

            var endpoint = "account/reset-password";
            var origin = BuildFrontUri(endpoint);
            var url = GenerateUri(userId, token, origin);

            return (token, url);
        }

        private string BuildFrontUri(string endpoint)
        {
            var baseUri = _configuration["AppSettings:FrontUri"] ?? "http://localhost:3000";
            return $"{baseUri}/{endpoint}";
        }

        private static string GenerateUri(Guid userId, string token, string origin)
        {
            var code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var uri = QueryHelpers.AddQueryString(origin, "userId", userId.ToString());
            uri = QueryHelpers.AddQueryString(uri, "code", code);
            return uri;
        }

        private static string RandomTokenString()
        {
            using var rng = RandomNumberGenerator.Create();
            var randomBytes = new byte[40];
            rng.GetBytes(randomBytes);
            return BitConverter.ToString(randomBytes).Replace("-", "");
        }
    }
}

