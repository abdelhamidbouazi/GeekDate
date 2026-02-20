using matcha.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace matcha.Infrastructure.EntitiesConfiguration
{
    public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
    {
        public void Configure(EntityTypeBuilder<AppUser> builder)
        {
            builder.ToTable(nameof(AppUser) + "s");
            builder.HasKey(x => x.Id);

            builder.Property(user => user.FirstName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(user => user.LastName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(user => user.UserName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(user => user.City)
               .HasMaxLength(50);

            builder.Property(user => user.Country)
               .HasMaxLength(50);

            builder.HasIndex(user => user.UserName)
               .IsUnique();

            builder.Property(user => user.Email)
              .IsRequired()
              .HasMaxLength(100);

            builder.HasIndex(user => user.Email)
              .IsUnique();

            builder.Property(x => x.DateOfBirth)
                .IsRequired(false)
                .HasDefaultValueSql("NULL");

            builder.Property(user => user.PasswordHash)
                .IsRequired();

            builder.Property(user => user.PasswordSalt)
               .IsRequired();

            //builder.Property(user => user.Gender)
            //    .IsRequired(false);

            //builder.Property(user => user.LookingFor)
            //    .IsRequired(false);

            //builder.Property(user => user.PreferredGender)
            //  .IsRequired(false);


            builder.Property(user => user.EmailConfirmed)
                .HasDefaultValue(false);

            builder.Property(user => user.Biography)
                .HasMaxLength(800);

        }
    }
}
