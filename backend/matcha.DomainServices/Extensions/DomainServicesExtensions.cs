using sparkdates.Application.Interfaces.Services;
using sparkdates.DomainServices.Chat;
using sparkdates.DomainServices.Services.InterestService;
using sparkdates.DomainServices.Services.Message;
using sparkdates.DomainServices.Services.UserInterestsService;
using sparkdates.DomainServices.Services.UserSearchPreferencesService;
using sparkdates.DomainServices.Services.UserService;
using sparkdates.DomainServices.UserPresence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace sparkdates.DomainServices.Extensions
{
    public static class DomainServicesExtensions
    {
        public static IServiceCollection AddDomainServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddScoped<IInterestService, InterestService>();
            services.AddScoped<IUserInterestsService, UserInterestsService>();
            services.AddScoped<IUserServiceAsync, UserServiceAsync>();
            services.AddScoped<IUserProfileService, UserProfileService>();
            services.AddScoped<IMatchmakingServiceAsync, MatchmakingServiceAsync>();
            services.AddScoped<IUserSearchServiceAsync, UserSearchServiceAsync>();
            services.AddScoped<IUserSearchPreferencesServiceAsync, UserSearchPreferencesServiceAsync>();
            services.AddScoped<IConversationServiceAsync, ConversationServiceAsync>();
            services.AddScoped<IMatchServiceAsync, MatchServiceAsync>();
            services.AddScoped<IMessageServiceAsync, MessageServiceAsync>();
            services.AddScoped<IConversationValidatorService, ConversationValidatorService>();
            services.AddScoped<IUserPresenceServiceAsync, UserPresenceServiceAsync>();

            return services;
        }
    }
}
