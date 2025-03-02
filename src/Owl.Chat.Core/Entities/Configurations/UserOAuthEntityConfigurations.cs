using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Owl.Chat.Core.Entities.Configurations;

public class UserOAuthEntityConfigurations : IEntityTypeConfiguration<UserOAuth>
{
    public void Configure(EntityTypeBuilder<UserOAuth> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Provider).HasMaxLength(50);

        builder.Property(x => x.Provider).IsRequired();


        builder.Property(x => x.UserId).HasMaxLength(36);

        builder.Property(x => x.UserId).IsRequired();

        builder.HasIndex(x => new { x.Provider, x.ProviderUserId, x.UserId }).IsUnique();

        builder.UseEntityConfiguration();
    }
}