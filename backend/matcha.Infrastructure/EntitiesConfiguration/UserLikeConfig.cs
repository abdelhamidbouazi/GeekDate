using sparkdates.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace sparkdates.Infrastructure.EntitiesConfiguration
{
    public class UserLikeConfig : IEntityTypeConfiguration<UserLike>
    {
        public void Configure(EntityTypeBuilder<UserLike> builder)
        {
            builder.ToTable(nameof(UserLike) + "s");

        }
    }
}
