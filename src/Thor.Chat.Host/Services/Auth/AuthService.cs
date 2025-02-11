using System.ComponentModel;
using System.Text.Json;
using FastService;
using Lazy.Captcha.Core;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.Auth.Input;
using Thor.Chat.Host.Services.User;

namespace Thor.Chat.Host.Services.Auth;

/// <summary>
/// 授权服务
/// </summary>
[Filter(typeof(ResultFilter))]
[Tags("Auth")]
public class AuthService(ICaptcha captcha, UserService userService, JwtHelper jwtHelper) : FastApi
{
    [EndpointSummary("登录")]
    public async Task<string> Login(AuthInput input)
    {
        // 校验验证码
        if (!captcha.Validate(input.CodeId, input.Code))
        {
            throw new BusinessException("验证码错误");
        }

        var user = await userService.GetAsync(input.UserName);

        // 校验密码
        if (user.PasswordHash != EncryptionHelper.Md5(input.Password))
        {
            throw new BusinessException("密码错误");
        }

        var dist = new Dictionary<string, string>
        {
            { "User", JsonSerializer.Serialize(user) }
        };

        // 生成token
        var token = jwtHelper.CreateToken(dist, user.Id, new[] { "User" });

        return await Task.FromResult(token);
    }
}