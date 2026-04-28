using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Infrastructure.ApplicationDbContext;
using matcha.Infrastructure.Database;
using matcha.Infrastructure.Repositories;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;
using matcha.Infrastructure.Seeding;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace matcha.Infrastructure.Extensions
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
