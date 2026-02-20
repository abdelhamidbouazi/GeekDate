namespace matcha.Application.Dtos.AccountDtos
{
    public class ForgetPasswordDto
    {
        public Guid UserId { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}
