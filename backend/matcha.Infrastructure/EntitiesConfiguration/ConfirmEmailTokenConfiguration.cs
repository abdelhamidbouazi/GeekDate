using matcha.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace matcha.Infrastructure.EntitiesConfiguration
{
    public class ConfirmEmailTokenConfiguration : IEntityTypeConfiguration<ConfirmEmailToken>
    {
        public void Configure(EntityTypeBuilder<ConfirmEmailToken> builder)
        {
            builder.Property(x => x.Token)
               .IsRequired()
               .HasMaxLength(255);

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.HasOne(x => x.User)
                .WithMany(x => x.ConfirmEmailTokens);

            builder.Property(x => x.ExpiredAt)
                .IsRequired();

            builder.Property(x => x.Expired)
                .HasDefaultValue(false);
        }
    }
}
