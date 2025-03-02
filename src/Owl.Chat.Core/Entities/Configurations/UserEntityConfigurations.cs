using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace .Chat.Core.Entities.Configurations;

/// <summary>
/// 用户实体配置
/// </summary>
public class UserEntityConfigurations : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Avatar).HasMaxLength(1000);

        builder.Property(x => x.Avatar).IsRequired(false);

        builder.Property(x => x.Email).HasMaxLength(50);

        builder.Property(x => x.Email).IsUnicode();

        builder.HasIndex(x => x.Email);

        builder.Property(x => x.UserName).HasMaxLength(50);

        builder.Property(x => x.UserName).IsUnicode();

        builder.HasIndex(x => x.UserName);

        builder.Property(x => x.Phone).HasMaxLength(20);

        builder.Property(x => x.Phone).IsUnicode(false);

        builder.HasIndex(x => x.Phone);

        builder.UseEntityConfiguration();
    }
}