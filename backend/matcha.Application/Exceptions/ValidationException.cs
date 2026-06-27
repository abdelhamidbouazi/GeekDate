namespace sparkdates.Application.Exceptions
{
    public class ValidationException : Exception
    {
        public Dictionary<string, string> Errors { get; set; }

        public ValidationException(string message) : base(message) { }
        public ValidationException(string msg, Dictionary<string, string> errors) : base(msg)
        {
            Errors = errors;
        }
    }
}
