using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.Interfaces.Services.Cloudinary;
using sparkdates.Application.Interfaces.Services.Notification;
using sparkdates.Infrastructure.Repositories;
using sparkdates.Infrastructure.Services.Authentication;
using sparkdates.Infrastructure.Services.CloudinaryStorage;
using sparkdates.Infrastructure.Services.Notification;
using sparkdates.Infrastructure.Services.RealtimeNotification;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace sparkdates.Infrastructure.Extensions
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
