using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace .Chat.Core.Entities.Configurations;

public class ChatMessageEntityConfigurations : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Role).HasMaxLength(255);

        builder.Property(x => x.Content).HasMaxLength(-1);

        builder.Property(x => x.PromptTokens).IsRequired();

        builder.Property(x => x.CompleteTokens).IsRequired();

        builder.Property(x => x.ResponseTime).IsRequired();

        builder.HasIndex(x => x.SessionId);

        builder.HasIndex(x => x.ShareId);

        builder.HasIndex(x => x.ChannelId);

        builder.HasIndex(x => x.ModelId);

        builder.UseEntityConfiguration();

        builder.Property(x => x.Files).HasConversion(
            v => JsonSerializer.Serialize(v, JsonSerializerOptions.Default),
            v => JsonSerializer.Deserialize<List<string>>(v, JsonSerializerOptions.Default)
        );
    }
}