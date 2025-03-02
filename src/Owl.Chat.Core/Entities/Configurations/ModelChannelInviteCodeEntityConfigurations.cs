using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Thor.Chat.Core.Entities.Configurations;

public class ModelChannelInviteCodeEntityConfigurations : IEntityTypeConfiguration<ModelChannelInviteCode>
{
    public void Configure(EntityTypeBuilder<ModelChannelInviteCode> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).IsRequired().HasMaxLength(32);

        builder.Property(x => x.Inviter).IsRequired();

        builder.Property(x => x.UsedUsers).HasConversion(
            v => JsonSerializer.Serialize(v, JsonOptions.DefaultJsonSerializerOptions),
            v => JsonSerializer.Deserialize<List<string>>(v, JsonOptions.DefaultJsonSerializerOptions));

        builder.HasIndex(x => new
        {
            x.ChannelId,
            x.Code,
            x.Inviter
        });

        builder.UseEntityConfiguration();
    }
}