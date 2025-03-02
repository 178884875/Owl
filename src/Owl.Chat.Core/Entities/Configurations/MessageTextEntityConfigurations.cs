using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Thor.Chat.Core.Entities.Configurations;

public class MessageTextEntityConfigurations : IEntityTypeConfiguration<MessageText>
{
    public void Configure(EntityTypeBuilder<MessageText> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.HasIndex(x => x.MessageId);

        builder.Property(x => x.SearchResults)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonSerializerOptions.Default),
                v => JsonSerializer.Deserialize<List<SearchResult>>(v, JsonSerializerOptions.Default) ??
                     new List<SearchResult>()
            );
        
        builder.Property(x => x.ExtraData)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonSerializerOptions.Default),
                v => JsonSerializer.Deserialize<Dictionary<string, string>>(v, JsonSerializerOptions.Default) ??
                     new Dictionary<string, string>());

        builder.UseEntityConfiguration();
    }
}