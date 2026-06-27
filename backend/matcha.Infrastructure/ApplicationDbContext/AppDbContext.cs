using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.EntitiesConfiguration;
using Microsoft.EntityFrameworkCore;

namespace sparkdates.Infrastructure.ApplicationDbContext
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppUserConfiguration).Assembly);
        }
        public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Interest> Interests { get; set; }
        public DbSet<UserInterest> UserInterests { get; set; }
        public DbSet<ConfirmEmailToken> ConfirmEmailTokens { get; set; }
        public DbSet<ResetPassword> ResetPasswords { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<ProfileView> ProfileViews { get; set; }
        public DbSet<UserLike> UserLikes { get; set; }
        public DbSet<UserBlock> UserBlocks { get; set; }
        public DbSet<UserSearchPreference> UserSearchPreferences { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Match> Matches { get; set; }


    }
}
