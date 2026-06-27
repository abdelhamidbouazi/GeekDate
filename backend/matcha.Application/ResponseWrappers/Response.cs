namespace sparkdates.Application.ResponseWrappers
{
    public class Response<T>
    {
        public Response(T data)
        {
            Data = data;
            IsSucceeded = true;
            StatusCode = 200;
        }

        public Response(string message, bool isSucceeded = true)
        {
            Message = message;
            IsSucceeded = isSucceeded;
            StatusCode = isSucceeded ? 200 : 400;
        }

        public bool IsSucceeded { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }


    }
}
