using Owl.Chat.Host.Dto;

namespace Owl.Chat.Host.Infrastructure;

/// <summary>
/// 服务包装器
/// </summary>
/// <param name="logger"></param>
public sealed class ResultFilter(ILogger<ResultFilter> logger) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var value = await next(context);

        return ResultDto.SuccessResult(value);
    }
}