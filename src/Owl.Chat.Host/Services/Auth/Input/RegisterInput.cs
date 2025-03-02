namespace Owl.Chat.Host.Services.Auth.Input;

public class RegisterInput
{
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
    /// 验证码
    /// </summary>
    public string? Code { get; set; }

    /// <summary>
    /// 验证码ID
    /// </summary>
    public string? CodeId { get; set; }

}