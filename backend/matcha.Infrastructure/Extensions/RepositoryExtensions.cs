using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.UoW;
using matcha.Infrastructure.Repositories;
using matcha.Infrastructure.UoW;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace matcha.Infrastructure.Extensions
{
    public static class RepositoryExtensions
    {
        public static IServiceCollection AddApplicationRepositories(this IServiceCollection services, IConfiguration config)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IAccountRepositoryAsync, AccountRepositoryAsync>();
            services.AddScoped<IInterestRepositoryAsync, InterestRepositoryAsync>();
            services.AddScoped<IUserInterestsRepositoyAsync, UserInterestsRepositoryAsync>();
            services.AddScoped<IUserRepositoryAsync, UserRepositoryAsync>();
            services.AddScoped<IUserLikesRepositoryAsync, UserLikesRepositoryAsync>();
            services.AddScoped<IUserBlocksRepositoryAsync, UserBlocksRepositoryAsync>();
            services.AddScoped<IConfirmEmailTokenRepositoryAsync, ConfirmEmailTokenRepositoryAsync>();
            services.AddScoped<IResetPasswordRepositoryAsync, ResetPasswordRepositoryAsync>();
            services.AddScoped<IPhotoRepositoryAsync, PhotoRepositoryAsync>();
            services.AddScoped<IRefreshTokenRepositoryAsync, RefreshTokenRepositoryAsync>();
            services.AddScoped<IUserSearchPreferenceRepositoryAsync, UserSearchPreferenceRepositoryAsync>();
            services.AddScoped<IConversationRepositoryAsync, ConversationRepositoryAsync>();
            services.AddScoped<IMatchRepositoryAsync, MatchRepositoryAsync>();
            services.AddScoped<IMessageRepositoryAsync, MessageRepositoryAsync>();
            services.AddScoped<INotificationRepositoryAsync, NotificationRepositoryAsync>();

            return services;
        }
    }
}
