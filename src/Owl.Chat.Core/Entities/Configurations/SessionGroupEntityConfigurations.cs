using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Owl.Chat.Core.Entities.Configurations;

public class SessionGroupEntityConfigurations : IEntityTypeConfiguration<SessionGroup>
{
    public void Configure(EntityTypeBuilder<SessionGroup> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Name).HasMaxLength(50);

        builder.Property(x => x.Name).IsRequired();

        builder.HasIndex(x => x.Name);

        builder.UseEntityConfiguration();
    }
}