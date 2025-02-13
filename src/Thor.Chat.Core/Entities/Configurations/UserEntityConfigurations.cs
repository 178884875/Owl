using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Thor.Chat.Core.Entities.Configurations;

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

        // 初始化用户
        var user = new User
        {
            Id = "F62438CE-D1FE-4183-91B4-409D6B45E7B9",
            UserName = "admin",
            PasswordHash = "4E71002969FCD46813B869E931AEDF4B",
            Email = "239573049@qq.com",
            Phone = "13049809673",
            Avatar = "https://avatars.githubusercontent.com/u/61819790?v=4",
            CreatedBy = string.Empty,
            Role = "Admin",
            DisplayName = "管理员",
            Enabled = true
        };
        
        builder.HasData(user);
        
        
    }
}