using System.ComponentModel;
using FastService;
using Lazy.Captcha.Core;
using Microsoft.AspNetCore.Authorization;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Services.Verification.Dto;

namespace Owl.Chat.Host.Services.Verification;

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