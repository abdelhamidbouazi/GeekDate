using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.Interfaces.Services.Cloudinary;
using matcha.Application.Interfaces.Services.Notification;
using matcha.Infrastructure.Repositories;
using matcha.Infrastructure.Services.Authentication;
using matcha.Infrastructure.Services.CloudinaryStorage;
using matcha.Infrastructure.Services.Notification;
using matcha.Infrastructure.Services.RealtimeNotification;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace matcha.Infrastructure.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
            services.AddScoped<ICloudinaryServiceAsync, CloudinaryServiceAsync>();
            services.AddTransient(typeof(IQueryBuilder<>), typeof(QueryBuilder<>));
            services.AddScoped<IRealtimeNotificationServiceAsync, SignalRNotificationService>();
            services.AddScoped<INotificationServiceAsync, NotificationServiceAsync>();


            return services;
        }
    }
}
