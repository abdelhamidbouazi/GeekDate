using sparkdates.Application.Features.Interests.Queries.GetInterests;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace sparkdates.Application.Extensions
{
    public static class ApplicationExtensions
    {
        public static IServiceCollection AddApplicationExtensions(this IServiceCollection services, IConfiguration config)
        {
            services.AddMediatR(mediatR => mediatR.RegisterServicesFromAssembly(typeof(GetInterestsQuery).Assembly));

            return services;
        }
    }
}
