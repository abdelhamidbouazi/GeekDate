namespace matcha.Shared.Constants
{
    public static class RegexConstants
    {
        public const string PASSWORD_REGEX = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
        public const string EMAIL_REGEX = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$";
    }
}
