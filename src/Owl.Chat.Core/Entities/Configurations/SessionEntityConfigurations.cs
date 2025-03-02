using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Owl.Chat.Core.Entities.Configurations;

public class SessionEntityConfigurations : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.HasIndex(x => x.SessionGroupId);

        builder.HasIndex(x => x.Name);

        builder.Property(x => x.System).HasMaxLength(-1);

        builder.Property(x => x.Tags).HasConversion(
            v => JsonSerializer.Serialize(v, JsonOptions.DefaultJsonSerializerOptions),
            v => JsonSerializer.Deserialize<string[]>(v, JsonOptions.DefaultJsonSerializerOptions));

        builder.UseEntityConfiguration();
    }
}