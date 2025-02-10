namespace Thor.Chat.Host.Dto;

public class UserDto : EntityDto<string>
{
    /// <summary>
    /// 用户Id
    /// </summary>
    public string? Avatar { get; set; }

    /// <summary>
    /// 用户名
    /// </summary>
    public string UserName { get; set; } = null!;

    /// <summary>
    /// 显示名称
    /// </summary>
    public string DisplayName { get; set; } = null!;

    /// <summary>
    /// 当前用户的密码
    /// </summary>
    public string? PasswordHash { get; set; }

    /// <summary>
    /// 当前用户的邮箱
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// 当前用户的电话
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// 当前用户的角色
    /// </summary>
    public string Role { get; set; } = null!;

    /// <summary>
    /// 是否启用账号
    /// </summary>
    public bool Enabled { get; set; }
}