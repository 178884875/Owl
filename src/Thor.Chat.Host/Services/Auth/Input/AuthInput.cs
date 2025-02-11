namespace Thor.Chat.Host.Services.Auth.Input;

public sealed class AuthInput
{
    public string UserName { get; set; }

    public string Password { get; set; }

    /// <summary>
    /// 验证码
    /// </summary>
    public string? Code { get; set; }

    /// <summary>
    /// 验证码ID
    /// </summary>
    public string? CodeId { get; set; }
}