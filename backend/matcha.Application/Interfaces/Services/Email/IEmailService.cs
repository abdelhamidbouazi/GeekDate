namespace sparkdates.Application.Interfaces.Services.Email
{
    public interface IEmailService
    {
        Task SendAsync(string reciever, string subject, string message);
    }
}
