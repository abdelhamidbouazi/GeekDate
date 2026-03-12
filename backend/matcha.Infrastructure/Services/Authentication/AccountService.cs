using matcha.Application.Dtos.AccountDtos;
using matcha.Application.Dtos.Users;
using matcha.Application.Exceptions;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.Interfaces.Services.Email;
using matcha.Application.Interfaces.UoW;
using matcha.Application.ResponseWrappers;
using matcha.Application.Shared;
using matcha.Domain.Entities;
using matcha.Shared.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace matcha.Infrastructure.Services.Authentication
{
    public class AccountService : IAccountService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticatedUser _userAuth;
        private readonly IUserRepositoryAsync _userRepositoryAsync;
        private readonly IRefreshTokenRepositoryAsync _refreshTokenRepo;
        private readonly IUserSearchPreferenceRepositoryAsync _userSearchPreferenceRepositoryAsync;

        public AccountService(IUnitOfWork unitOfWork, IEmailService emailService, IJwtTokenGenerator jwtTokenGenerator, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IAuthenticatedUser user,
          IUserSearchPreferenceRepositoryAsync userSearchPreferenceRepositoryAsync)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _jwtTokenGenerator = jwtTokenGenerator;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            this._userAuth = user;
            _userRepositoryAsync = _unitOfWork.GetRepository<IUserRepositoryAsync>();
            _refreshTokenRepo = _unitOfWork.GetRepository<IRefreshTokenRepositoryAsync>();
            _userSearchPreferenceRepositoryAsync = userSearchPreferenceRepositoryAsync;
        }

        #region LoginService
        private async Task<bool> IsUserExist(string userName) => await _unitOfWork.GetRepository<IAccountRepositoryAsync>()
            .AnyAsync(user => user.UserName == userName);

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            if (!await IsUserExist(request.UserName)) throw new ValidationException("The UserName or Password is Incorrect");

            var user = await _userRepositoryAsync.GetUserWithPhotosByUserNameAsync(request.UserName);

            //var userHasTokenExpired = await  _userRepositoryAsync.FirstOrDefaultAsync(u => u.Id == user.Id);

            CheckPassword(user, request.Password);

            var refreshToken = await ManageRefreshTokenWhenLogin(user);

            return CreateLoginResponse(user, refreshToken);
        }
        private async Task<RefreshToken> ManageRefreshTokenWhenLogin(AppUser user)
        {
            var ipAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = _jwtTokenGenerator.GenerateRefreshToken(),
                ExpriesOnUtc = DateTime.UtcNow.AddDays(14),
                LastUsedUtc = DateTime.UtcNow,
                IpAddress = GetClientIpAddress(),
                UserId = user.Id,
                User = user,
                CreatedAt = DateTime.UtcNow
            };
            await DeleteAllPreviousRefreshTokensAsync(user.Id, refreshToken.IpAddress);

            await _refreshTokenRepo.AddAsync(refreshToken);

            return refreshToken;
        }
        private void CheckPassword(AppUser user, string password)
        {
            using HMACSHA512 hmac = new HMACSHA512(user.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            if (!computedHash.SequenceEqual(user.PasswordHash)) throw new ValidationException("The UserName or Password is Incorrect");
        }
        private LoginResponseDto CreateLoginResponse(AppUser user, RefreshToken refreshToken)
        {
            return new LoginResponseDto
            {
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                isEmailVerified = user.EmailConfirmed,
                IsProfileCompleted = user.IsProfileCompleted,
                AccessToken = _jwtTokenGenerator.CreateToken(user),
                RefreshToken = refreshToken.Token,
                ProfilePhotoUrl = user.Photos
                   .Where(p => p.IsMain == true)
                   .Select(p => p.Url)
                   .FirstOrDefault()
            };
        }

        private async Task DeleteAllPreviousRefreshTokensAsync(Guid userId, string ipAddress)
        {
            await _refreshTokenRepo.DeleteRefreshTokenByUserIdAndIp(userId, ipAddress);
        }

        private string GetClientIpAddress()
        {
            return _httpContextAccessor!.HttpContext?.Connection?.RemoteIpAddress?.ToString();
        }
        public async Task<string> GenerateNewAccessToken(string refreshToken)
        {
            // Validate input
            if (string.IsNullOrEmpty(refreshToken))
                throw new ApiException(nameof(refreshToken) + " is empty");

            // Get and validate refresh token
            RefreshToken refreshTokenEntity = await _refreshTokenRepo.GetByTokenAsync(refreshToken);

            if (refreshTokenEntity is null)
                throw new ApiException("Invalid refresh token");

            var ipAddress = GetClientIpAddress();

            var lastToken = await _refreshTokenRepo.GetLastRefreshTokenByUserIdAsync(refreshTokenEntity.UserId, ipAddress);
            if (lastToken.Id != refreshTokenEntity.Id)
            {
                // If the last token is not the same as the current one, delete the current token
                await _refreshTokenRepo.Delete(refreshTokenEntity);
                throw new ApiException("Invalid refresh token");
            }

            if (refreshTokenEntity.ExpriesOnUtc < DateTime.UtcNow)
            {
                await _refreshTokenRepo.Delete(refreshTokenEntity);
                throw new ApiException("The refresh token has expired");
            }

            // Verify this token belongs to the requesting device
            if (refreshTokenEntity.IpAddress != ipAddress)
                throw new ApiException("Invalid device");

            var userRefreshTokens = await _refreshTokenRepo.GetAllTokensByUserIdAsync(refreshTokenEntity.UserId);

            foreach (var token in userRefreshTokens)
            {
                // Remove only if token is expired or hasn't been used in a long time (e.g., 30 days)
                if (token.ExpriesOnUtc < DateTime.UtcNow || token.LastUsedUtc < DateTime.UtcNow.AddDays(-30))
                    await _refreshTokenRepo.Delete(token);
            }

            var user = await _userRepositoryAsync.FindAsync(refreshTokenEntity.UserId);
            await UpdateRefreshTokens(refreshTokenEntity);
            return _jwtTokenGenerator.CreateToken(user);
        }

        public async Task UpdateRefreshTokens(RefreshToken refreshToken)
        {
            refreshToken.LastUsedUtc = DateTime.UtcNow;

            await _refreshTokenRepo.Update(refreshToken);
        }

        #endregion

        #region RegisterService
        public async Task<LoginDto> RegisterAsync(RegisterDto registerDto)
        {
            await validateUserRegistration(registerDto);

            using HMACSHA512 hmac = new HMACSHA512();

            var user = new AppUser()
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                UserName = registerDto.UserName,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.password)),
                PasswordSalt = hmac.Key
            };

            await _unitOfWork.GetRepository<IAccountRepositoryAsync>().AddAsync(user);

            await SendConfirmationEmail(user.Id);

            return new LoginDto
            {
                Username = user.UserName,
                Token = _jwtTokenGenerator.CreateToken(user)
            };
        }
        #endregion


        #region EmailConfirmation
        public async Task ConfirmEmailAsync(Guid userId, string token)
        {
            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FirstOrDefaultAsync(x => x.Id == userId);
            if (user is null)
                throw new NotFoundException($"User with the given id {userId} was not found.");

            // Already verified — idempotent, no error
            if (user.EmailConfirmed)
                return;

            var confirmEmailToken = await _unitOfWork.GetRepository<IConfirmEmailTokenRepositoryAsync>()
                    .GetConfirmEmailTokenByUserId(userId);

            if (confirmEmailToken is null)
                throw new NotFoundException("The user does not have any current valid token.");

            if (!confirmEmailToken.Token.Equals(DecodeToken(token), StringComparison.OrdinalIgnoreCase))
                throw new ValidationException("Invalid or expired verification token.");

            user.EmailConfirmed = true;
            await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);
            await _unitOfWork.GetRepository<IConfirmEmailTokenRepositoryAsync>()
                    .UpdateAllTokensByUserId(userId);
        }

        public async Task SendConfirmationEmail(Guid userId)
        {
            var token = GenerateVerificationToken();
            var confirmationMailEndpoint = "account/confirm-email";
            var baseUri = BuildUri(confirmationMailEndpoint, isFrontEnd: true);

            var confirmEmailToken = new ConfirmEmailToken()
            {
                Expired = false,
                ExpiredAt = DateTime.UtcNow.AddHours(1),
                Token = token,
                UserId = userId
            };
            var entity = await _unitOfWork.GetRepository<IConfirmEmailTokenRepositoryAsync>().AddAsync(confirmEmailToken);

            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FirstOrDefaultAsync(x => x.Id == userId);

            var confirmationLink = GenerateUri(userId, token, baseUri!, confirmationMailEndpoint);

            var placeHolders = EmailTemplates.BuildPlaceHolders(user.UserName, confirmationLink);

            if (entity is not null)
                await _emailService.SendAsync(user.Email, "Confirmation Email", EmailTemplates.BuildEmailTemplate(EmailTemplates.ConfirmationEmailTemplate, placeHolders));
        }
        #endregion

        #region ResetPassword
        public async Task SendResetPasswordEmail(string email)
        {
            var user = await _userRepositoryAsync.FirstOrDefaultAsync(x => x.Email == email);
            if (user is null) return;

            var resetPasswordEndpoint = "account/reset-password";
            var baseUri = BuildUri(resetPasswordEndpoint, isFrontEnd: true);
            var token = GenerateVerificationToken();

            var resetPasswordToken = new ResetPassword()
            {
                UserId = user.Id,
                Token = token,
                Expired = false,
                ExpiryDate = DateTime.UtcNow.AddHours(1)
            };

            var result = await _unitOfWork.GetRepository<IResetPasswordRepositoryAsync>().AddAsync(resetPasswordToken);
            // Build the confirmation link
            var confirmationLink = GenerateUri(user.Id, token, baseUri, resetPasswordEndpoint);
            var placeHolders = EmailTemplates.BuildPlaceHolders(user.UserName, confirmationLink);

            if (result is not null)
                await _emailService.SendAsync(user.Email, "Reset Password", EmailTemplates.BuildEmailTemplate(EmailTemplates.ResetPasswordTemplate, placeHolders));
        }

        public async Task<bool> ResetPasswordAsync(Guid userId, string token, string newPassword)
        {
            var resetPasswordToken = await _unitOfWork.GetRepository<IResetPasswordRepositoryAsync>().GetLastUserTokenAsync(userId);

            if (resetPasswordToken is null)
                throw new NotFoundException("The user does not have any current valid token.");

            if (!resetPasswordToken.Token.Equals(DecodeToken(token), StringComparison.OrdinalIgnoreCase))
                throw new ValidationException("The token is not valid.");

            if (resetPasswordToken.ExpiryDate < DateTime.UtcNow)
                throw new ValidationException("The token is expired.");

            // if the token is valid and not expired reset the password
            using (HMACSHA512 hmac = new HMACSHA512())
            {
                var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FirstOrDefaultAsync(x => x.Id == userId);

                if (user is null)
                    throw new NotFoundException($"User was not found.");

                user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(newPassword));
                user.PasswordSalt = hmac.Key;

                await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);
                //await _unitOfWork.GetRepository<IUserRepositoryAsync>().SaveChangesAsync();

                resetPasswordToken.Expired = true;
                await _unitOfWork.GetRepository<IResetPasswordRepositoryAsync>().Update(resetPasswordToken);
                //await _unitOfWork.GetRepository<IResetPasswordRepositoryAsync>().SaveChangesAsync();
            }

            return true;
        }
        #endregion

        #region Token Validation
        private ClaimsResult ExtractClaims(ClaimsPrincipal user)
        {
            var emailVerifiedClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimConstants.EMAIL_VERIFIED_CLAIM)?.Value;
            var profileCompletedClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimConstants.PROFILE_COMPLETED_CLAIM)?.Value;
            var userIdClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimConstants.USER_ID_CLAIM)?.Value;
            var expClaim = user.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Exp)?.Value;

            if (string.IsNullOrEmpty(emailVerifiedClaim) || string.IsNullOrEmpty(profileCompletedClaim) || string.IsNullOrEmpty(userIdClaim))
            {
                return new ClaimsResult
                {
                    IsValid = false,
                    ErrorMessage = "Invalid token: Missing required claims."
                };
            }

            bool emailVerified = bool.TryParse(emailVerifiedClaim, out var ev) && ev;
            bool profileCompleted = bool.TryParse(profileCompletedClaim, out var pc) && pc;

            DateTime? expiration = null;
            if (!string.IsNullOrEmpty(expClaim))
            {
                expiration = DateTimeOffset.FromUnixTimeSeconds(long.Parse(expClaim)).UtcDateTime;
            }

            return new ClaimsResult
            {
                IsValid = true,
                EmailVerified = emailVerified,
                ProfileCompleted = profileCompleted,
                UserId = userIdClaim,
                Expiration = expiration
            };

        }

        private bool IsTokenExpired(DateTime? expiration)
        {
            return expiration.HasValue && expiration.Value < DateTime.UtcNow;
        }

        public async Task<TokenValidationResult> ValidateToken(ClaimsPrincipal user)
        {
            var claims = ExtractClaims(user);

            if (!claims.IsValid)
            {
                return new TokenValidationResult
                {
                    IsValid = false,
                    Message = claims.ErrorMessage
                };
            }

            var userEntity = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FindAsync(Guid.Parse(claims.UserId));
            if (userEntity is null)
            {
                return new TokenValidationResult
                {
                    IsValid = false,
                    Message = "Invalid token: User does not exist."
                };
            }

            // Validate token expiration
            if (IsTokenExpired(claims.Expiration))
            {
                return new TokenValidationResult
                {
                    IsValid = false,
                    Message = "Invalid token: Token has expired."
                };
            }

            return new TokenValidationResult
            {
                IsValid = true,
                EmailVerified = userEntity.EmailConfirmed,
                ProfileCompleted = userEntity.IsProfileCompleted,
                Message = "Token is valid and user meets the required conditions."
            };
        }

        #endregion

        #region helperFunctions
        private async Task validateUserRegistration(RegisterDto registerDto)
        {

            //if (string.IsNullOrEmpty(registerDto.UserName))
            //{
            //    throw new ValidationException("Validation errors occured.", new() { { nameof(registerDto.UserName), "User name cannot be empty" } });
            //}

            //if (string.IsNullOrEmpty(registerDto.FirstName))
            //{
            //    throw new ApiException("FirstName is missing.");
            //}

            //if (string.IsNullOrEmpty(registerDto.LastName))
            //{
            //    throw new ApiException("LastName is missing.");
            //}

            //if (string.IsNullOrEmpty(registerDto.password))
            //{
            //    throw new ApiException("Password is missing.");
            //}

            //if (!Regex.Match(registerDto.Email, emailPattern).Success)
            //{
            //    throw new ApiException("The email address entered is invalid. Please check and try again.");
            //}

            //if (!Regex.Match(registerDto.password, passwordPattern).Success)
            //{
            //    throw new ApiException("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
            //}

            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().AnyAsync(u => u.UserName == registerDto.UserName);
            if (user)
                throw new ValidationException("Validation errors occured.", new() { { nameof(registerDto.UserName), "Username already exist" } });

            user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().AnyAsync(u => u.Email == registerDto.Email);
            if (user)
                throw new ValidationException("Validation errors occured.", new() { { nameof(registerDto.Email), "Email already exist" } });
        }
        private string GenerateVerificationToken() => RandomTokenString();
        private string EncodeToken(string token) => WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        private string DecodeToken(string token) => Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));

        private string RandomTokenString()
        {
            using var rngCryptoServiceProvider = RandomNumberGenerator.Create();
            var randomBytes = new byte[40];
            rngCryptoServiceProvider.GetBytes(randomBytes);
            // convert random bytes to hex string
            return BitConverter.ToString(randomBytes).Replace("-", "");
        }
        private string GenerateUri(Guid userId, string token, string origin, string endPoint)
        {
            var code = EncodeToken(token);

            // origin already contains the full URL (e.g. http://localhost:3000/account/confirm-email)
            // so just add query params directly — no need to append endPoint again
            var verificationUri = QueryHelpers.AddQueryString(origin, "userId", userId.ToString());
            verificationUri = QueryHelpers.AddQueryString(verificationUri, "code", code);

            return verificationUri;
        }

        private string BuildUri(string endpoint, bool isFrontEnd)
        {
            var baseUri = isFrontEnd
                ? _configuration["AppSettings:FrontUri"]
                : _configuration["AppSettings:BaseUri"];

            return $"{baseUri}/{endpoint}";
        }

        public async Task LogOut()
        {
            if (!_userAuth.Authenticated) return;

            await _refreshTokenRepo.DeleteRefreshTokenByUserIdAndIp(_userAuth.UserId, GetClientIpAddress());
        }

        public async Task<GetUserBirthdayDto> GetUserBirthdayAsync(Guid userId)
        {
            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FindAsync(userId);
            if (user == null) return null;

            return new GetUserBirthdayDto
            {
                Id = user.Id,
                Birthday = user.DateOfBirth.Value
            };
        }

        #endregion
    }
}
