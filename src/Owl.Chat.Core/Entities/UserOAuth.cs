namespace .Chat.Core.Entities;

/// <summary>
/// 用户绑定的第三方平台
/// </summary>
public sealed class UserOAuth : Entity<string>
{
    public required string UserId { get; set; }

    /// <summary>
    /// 获取或设置 OAuth 提供者的名称（如 Google, Facebook, etc.）
    /// </summary>
    public string Provider { get; set; }

    /// <summary>
    /// 获取或设置 OAuth 提供者分配给用户的唯一标识符
    /// </summary>
    public string ProviderUserId { get; set; }
}