using sparkdates.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace sparkdates.Infrastructure.EntitiesConfiguration
{
    public class UserInterestConfig : IEntityTypeConfiguration<UserInterest>
    {
        public void Configure(EntityTypeBuilder<UserInterest> builder)
        {
            builder.ToTable(nameof(UserInterest) + "s");
        }
    }
}
