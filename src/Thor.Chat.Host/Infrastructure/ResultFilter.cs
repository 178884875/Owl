using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Infrastructure;

/// <summary>
/// 服务包装器
/// </summary>
/// <param name="logger"></param>
public sealed class ResultFilter(ILogger<ResultFilter> logger) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        try
        {
            var value = await next(context);

            return ResultDto.SuccessResult(value);
        }
        catch (Exception e)
        {
            logger.LogError(e, "An error occurred while processing the request");
            return ResultDto.FailResult(e.Message);
        }
    }
}