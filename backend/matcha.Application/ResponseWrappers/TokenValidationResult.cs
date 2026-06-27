namespace sparkdates.Application.ResponseWrappers
{
    public class TokenValidationResult
    {
        public bool IsValid { get; set; }
        public string Message { get; set; }
        public bool EmailVerified { get; set; }
        public bool ProfileCompleted { get; set; }
        public string Error { get; set; }
    }
}
