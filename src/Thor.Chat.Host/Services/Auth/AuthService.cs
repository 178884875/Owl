using System.ComponentModel;
using System.Text.Json;
using System.Text.RegularExpressions;
using FastService;
using Lazy.Captcha.Core;
using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;
using Thor.Chat.Host.Dto;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.Auth.Input;
using Thor.Chat.Host.Services.User;
using Thor.Chat.Host.Services.User.Dto;

namespace Thor.Chat.Host.Services.Auth;

/// <summary>
/// 授权服务
/// </summary>
[Filter(typeof(ResultFilter))]
[Tags("Auth")]
public class AuthService(ICaptcha captcha, UserService userService, JwtHelper jwtHelper, IDbContext dbContext) : FastApi
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

        user.PasswordHash = string.Empty;
        user.Phone = string.Empty;

        var dist = new Dictionary<string, string>
        {
            { "User", JsonSerializer.Serialize(user) }
        };

        // 生成token
        var token = jwtHelper.CreateToken(dist, user.Id, [user.Role]);

        return await Task.FromResult(token);
    }

    /// <summary>
    /// 注册账号
    /// </summary>
    [EndpointSummary("注册账号")]
    public async Task<string> Register(RegisterInput input)
    {
        // 校验邮箱格式
        if (!string.IsNullOrEmpty(input.Email) &&
            !Regex.IsMatch(input.Email, @"^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$"))
        {
            throw new BusinessException("邮箱格式不正确");
        }

        // 校验手机号格式
        if (!string.IsNullOrEmpty(input.Phone) && !Regex.IsMatch(input.Phone, @"^1[3456789]\d{9}$"))
        {
            throw new BusinessException("手机号格式不正确");
        }

        // 校验密码长度和复杂度至少六位
        if (string.IsNullOrEmpty(input.PasswordHash) || input.PasswordHash.Length < 6 ||
            !Regex.IsMatch(input.PasswordHash, @"^(?=.*[0-9])(?=.*[a-zA-Z]).*$"))
        {
            throw new BusinessException("密码长度至少6位，且必须包含字母和数字");
        }

        // 校验用户名是否重复
        if (await dbContext.Users.AnyAsync(x => x.UserName == input.UserName))
        {
            throw new BusinessException("用户名已存在");
        }


        // 校验验证码
        if (!captcha.Validate(input.CodeId, input.Code))
        {
            throw new BusinessException("验证码错误");
        }

        var user = await userService.GetAsync(input.UserName);

        if (user != null)
        {
            throw new BusinessException("用户名已存在");
        }

        // 校验手机号
        if (await dbContext.Users.AnyAsync(x => x.Phone == input.Phone))
        {
            throw new BusinessException("手机号已存在");
        }

        // 校验邮箱
        if (await dbContext.Users.AnyAsync(x => x.Email == input.Email))
        {
            throw new BusinessException("邮箱已存在");
        }

        var userEntity = new Core.Entities.User()
        {
            UserName = input.UserName,
            DisplayName = input.DisplayName,
            PasswordHash = input.PasswordHash,
            Email = input.Email,
            Phone = input.Phone,
            Role = "User",
            Enabled = true,
            Avatar = "/images/avatar.jpg",
            CreatedAt = DateTime.Now,
        };

        await dbContext.Users.AddAsync(userEntity);

        await dbContext.SaveChangesAsync();

        user.PasswordHash = string.Empty;
        user.Phone = string.Empty;

        var dist = new Dictionary<string, string>
        {
            { "User", JsonSerializer.Serialize(user) }
        };

        // 生成token
        var token = jwtHelper.CreateToken(dist, user.Id, [user.Role]);

        return await Task.FromResult(token);
    }
}