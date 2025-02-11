using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Thor.Chat.Core.Entities.Configurations;

public class FileStorageEntityConfigurations : IEntityTypeConfiguration<FileStorage>
{
    public void Configure(EntityTypeBuilder<FileStorage> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.FileName).HasMaxLength(255);
        builder.Property(x => x.FileName).IsRequired();

        builder.Property(x => x.ContentType).HasMaxLength(255);
        builder.Property(x => x.ContentType).IsRequired();

        builder.Property(x => x.Size).IsRequired();

        builder.HasIndex(x => x.ProviderId);

        builder.UseEntityConfiguration();
    }
}