using sparkdates.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace sparkdates.Infrastructure.EntitiesConfiguration
{
    public class UserBlockConfig : IEntityTypeConfiguration<UserBlock>
    {
        public void Configure(EntityTypeBuilder<UserBlock> builder)
        {
            builder.ToTable(nameof(UserBlock) + "s");
        }
    }
}
