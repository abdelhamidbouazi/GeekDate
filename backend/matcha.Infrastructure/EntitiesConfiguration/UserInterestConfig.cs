using matcha.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace matcha.Infrastructure.EntitiesConfiguration
{
    public class UserInterestConfig : IEntityTypeConfiguration<UserInterest>
    {
        public void Configure(EntityTypeBuilder<UserInterest> builder)
        {
            builder.ToTable(nameof(UserInterest) + "s");
        }
    }
}
