using System.ComponentModel;
using FastService;
using Lazy.Captcha.Core;
using Microsoft.AspNetCore.Authorization;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.Verification.Dto;

namespace Thor.Chat.Host.Services.Verification;

/// <summary>
/// 验证码服务
/// </summary>
/// <param name="captcha"></param>
[Filter(typeof(ResultFilter))]
[Tags("Verification")]
public class VerificationService(ICaptcha captcha) : FastApi
{
    [EndpointSummary("获取验证码")]
    public Task<VerificationDto> GetAsync(string type)
    {
        var uuid = type + ":" + Guid.NewGuid().ToString("N");

        var code = captcha.Generate(uuid, 240);

        return Task.FromResult(new VerificationDto
        {
            Id = uuid,
            Code = "data:image/png;base64," + code.Base64
        });
    }
}