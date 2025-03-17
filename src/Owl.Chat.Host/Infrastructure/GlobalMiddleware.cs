using System.Text.Json;
using Owl.Chat.Host.Dto;

namespace Owl.Chat.Host.Infrastructure;

public sealed class GlobalMiddleware(ILogger<GlobalMiddleware> logger) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (UnauthorizedAccessException)
        {
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(ResultDto.FailResult("未授权")));
        }
        catch (BusinessException e)
        {
            context.Response.StatusCode = 400;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(ResultDto.FailResult(e.Message));
        }
        catch (Exception e) when (e is ArgumentException or ArgumentNullException)
        {
            context.Response.StatusCode = 400;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(ResultDto.FailResult("参数错误"));
        }
        catch (Exception e)
        {
            logger.LogError(e, "GlobalMiddleware Error");

            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(ResultDto.FailResult("服务器内部错误"));
        }
    }
}