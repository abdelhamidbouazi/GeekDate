using sparkdates.Infrastructure.ApplicationDbContext;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace sparkdates.Infrastructure.Extensions
{
    public static class MigrationExtensions
    {
        public static void ApplyMigration(this IApplicationBuilder app)
        {
            using IServiceScope scope = app.ApplicationServices.CreateScope();

            using AppDbContext context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            if (context.Database.GetPendingMigrations().Count() > 0)
                context.Database.Migrate();
        }
    }
}
