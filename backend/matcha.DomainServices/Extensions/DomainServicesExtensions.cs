using matcha.Application.Interfaces.Services;
using matcha.DomainServices.Chat;
using matcha.DomainServices.Services.InterestService;
using matcha.DomainServices.Services.Message;
using matcha.DomainServices.Services.UserInterestsService;
using matcha.DomainServices.Services.UserSearchPreferencesService;
using matcha.DomainServices.Services.UserService;
using matcha.DomainServices.UserPresence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace matcha.DomainServices.Extensions
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
