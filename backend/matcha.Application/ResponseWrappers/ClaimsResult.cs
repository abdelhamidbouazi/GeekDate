namespace matcha.Application.ResponseWrappers
{
    public class ClaimsResult
    {
        public bool IsValid { get; set; }
        public string ErrorMessage { get; set; }
        public bool EmailVerified { get; set; }
        public bool ProfileCompleted { get; set; }
        public string UserId { get; set; }
        public DateTime? Expiration { get; set; }
    }
}
