using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Infrastructure.ApplicationDbContext;
using sparkdates.Infrastructure.Database;
using sparkdates.Infrastructure.Repositories;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;
using sparkdates.Infrastructure.Seeding;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace sparkdates.Infrastructure.Extensions
{
    public static class ApplicationDbContextExtension
    {
        public static IServiceCollection AddDbContextRegistration(
                        this IServiceCollection services,
                        IConfiguration config)
        {
            var provider = config.GetValue<string>("DatabaseProvider");

            if (provider != "SqlServer")
                throw new InvalidOperationException("Only SqlServer is supported");

            var sqlMode = config.GetValue<string>("SqlMode") ?? "Local";

            var connectionName = sqlMode == "Docker"
                ? "SqlDocker"
                : "SqlLocal";

            var connectionString = config.GetConnectionString(connectionName);

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString, sql =>
                    sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)));

            services.AddScoped(_ => new SqlConnection(connectionString));

            services.AddTransient(typeof(IQueryBuilder<>), typeof(QueryBuilder<>));
            services.AddScoped<IDatabaseService, DatabaseService>();
            services.AddScoped(typeof(IGenericRepoAsync<>), typeof(GenericRepoAsync<>));
            services.AddScoped<Seed>();

            return services;
        }
    }
}
