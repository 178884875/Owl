using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace .Chat.Core.Entities.Configurations;

public class ModelChannelShareUserEntityConfigurations : IEntityTypeConfiguration<ModelChannelShareUser>
{
    public void Configure(EntityTypeBuilder<ModelChannelShareUser> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.HasIndex(x => x.ChannelId);
        builder.HasIndex(x => x.UserId);

        builder.UseEntityConfiguration();

        builder.HasOne(x => x.Channel)
            .WithMany()
            .HasForeignKey(x => x.ChannelId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.ChannelId, x.UserId }).IsUnique();
    }
}