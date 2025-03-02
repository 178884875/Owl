using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Thor.Chat.Core.Entities.Configurations;

public class ModelEntityConfigurations : IEntityTypeConfiguration<Model>
{
    public void Configure(EntityTypeBuilder<Model> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.DisplayName).IsRequired().HasMaxLength(100);
        builder.Property(m => m.Description).HasMaxLength(500);
        builder.Property(m => m.Description).IsRequired(false);
        builder.Property(m => m.Type).IsRequired().HasMaxLength(50);
        builder.Property(m => m.ContextWindowTokens);
        builder.Property(m => m.MaxOutput);
        builder.Property(m => m.ReleasedAt);
        builder.Property(m => m.ModelId);

        builder.Property(m => m.Enabled);

        builder.Property(m => m.Pricing)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions.DefaultJsonSerializerOptions),
                v => JsonSerializer.Deserialize<Pricing>(v, JsonOptions.DefaultJsonSerializerOptions));

        builder.Property(m => m.Abilities)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions.DefaultJsonSerializerOptions),
                v => JsonSerializer.Deserialize<Abilities>(v, JsonOptions.DefaultJsonSerializerOptions));

        builder.Property(m => m.Resolutions)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions.DefaultJsonSerializerOptions),
                v => JsonSerializer.Deserialize<string[]>(v, JsonOptions.DefaultJsonSerializerOptions));

        builder.UseEntityConfiguration();

        builder.HasIndex(m => m.DisplayName);
        builder.HasIndex(m => m.Provider);
    }
}