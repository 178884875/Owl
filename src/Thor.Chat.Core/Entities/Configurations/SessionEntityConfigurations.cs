using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Thor.Chat.Core.Entities.Configurations;

public class SessionEntityConfigurations : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.HasIndex(x => x.SessionGroupId);

        builder.HasIndex(x => x.Name);

        builder.UseEntityConfiguration();
    }
}