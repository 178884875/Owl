using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Owl.Chat.Core.Entities.Configurations;

public class ModelChannelEntityConfigurations : IEntityTypeConfiguration<ModelChannel>
{
    public void Configure(EntityTypeBuilder<ModelChannel> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.HasIndex(x => x.Provider);

        builder.HasIndex(x => x.Name);

        builder.UseEntityConfiguration();
        
        builder.Property(x => x.ModelIds).HasConversion(
            v => JsonSerializer.Serialize(v, JsonOptions.DefaultJsonSerializerOptions),
            v => JsonSerializer.Deserialize<List<string>>(v, JsonOptions.DefaultJsonSerializerOptions));

        builder.Property(x => x.Tags).HasConversion(
            v => JsonSerializer.Serialize(v, JsonOptions.DefaultJsonSerializerOptions),
            v => JsonSerializer.Deserialize<string[]>(v, JsonOptions.DefaultJsonSerializerOptions));

        builder.Property(x => x.Keys).HasConversion(
            v => JsonSerializer.Serialize(v, JsonOptions.DefaultJsonSerializerOptions),
            v => JsonSerializer.Deserialize<List<ModelChannelKey>>(v, JsonOptions.DefaultJsonSerializerOptions));

        builder
            .HasMany(x => x.ShareUsers)
            .WithOne(x => x.Channel)
            .HasForeignKey(x => x.ChannelId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}