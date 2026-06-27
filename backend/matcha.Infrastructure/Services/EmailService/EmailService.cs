using sparkdates.Application.Interfaces.Services.Email;
using sparkdates.Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace sparkdates.Infrastructure.Services.EmailService
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _mailConfig;
        private readonly ILogger<EmailService> _logger;
        public EmailService(IOptions<EmailSettings> mailOptions, ILogger<EmailService> logger)
        {
            _mailConfig = mailOptions.Value;
            _logger = logger;
        }
        public async Task SendAsync(string reciever, string subject, string body)
        {
            _logger.LogInformation(
                "Sending email '{Subject}' to {Receiver} through SMTP server {SmtpServer}:{Port}.",
                subject,
                reciever,
                _mailConfig.SmtpServer,
                _mailConfig.Port);

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

