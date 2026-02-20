using matcha.Application.Interfaces.Services.Email;
using matcha.Infrastructure.Settings;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace matcha.Infrastructure.Services.EmailService
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _mailConfig;
        private readonly AppSettings _appSettings;
        public EmailService(IOptions<EmailSettings> mailOptions, IOptions<AppSettings> appOptions)
        {
            _mailConfig = mailOptions.Value;
            _appSettings = appOptions.Value;
        }
        public async Task SendAsync(string reciever, string subject, string body)
        {
            using (var client = new SmtpClient(_mailConfig.SmtpServer))
            {
                client.Port = _mailConfig.Port;
                client.EnableSsl = _mailConfig.EnableSsl;
                client.Credentials = new NetworkCredential(_mailConfig.Email, _mailConfig.Password);
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_mailConfig.Email),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                };

                mailMessage.To.Add(reciever);

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}

