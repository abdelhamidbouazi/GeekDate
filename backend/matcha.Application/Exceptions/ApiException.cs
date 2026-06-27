namespace sparkdates.Application.Exceptions
{
    public class ApiException : Exception
    {
        private readonly Exception _exception;
        public ApiException() { }

        public ApiException(string message) : base(message) { }
        public ApiException(string message, Exception ex) : base(message)
        {
            _exception = ex;
        }

        public Exception GetException() => _exception;
    }
}
