using matcha.Application.Interfaces.Services.Email;
using matcha.Infrastructure.Services.EmailService;
using matcha.Infrastructure.Settings;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace matcha.Infrastructure.Extensions
{
    public static class EmailServiceExtension
    {
        public static IServiceCollection AddEmailService(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<EmailSettings>(configuration.GetSection("SmtpSettings"));
            services.Configure<AppSettings>(configuration.GetSection("AppSettings"));

            services.AddScoped<IEmailService, EmailService>();

            return services;
        }
    }
}
