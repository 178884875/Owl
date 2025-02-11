using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Thor.Chat.Core.Entities.Configurations;

public class MessageFileEntityConfigurations : IEntityTypeConfiguration<MessageFile>
{
    public void Configure(EntityTypeBuilder<MessageFile> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.HasIndex(x => x.MessageId);
        
        builder.HasIndex(x => x.FileId);
        
        builder.UseEntityConfiguration();
    }
}