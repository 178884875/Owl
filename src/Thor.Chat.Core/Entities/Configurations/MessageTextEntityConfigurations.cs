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
        
        builder.UseEntityConfiguration();
    }
}