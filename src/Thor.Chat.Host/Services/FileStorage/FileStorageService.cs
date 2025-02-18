using FastService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;
using Storage.Core;
using Thor.Chat.Core;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Options;

namespace Thor.Chat.Host.Services.FileStorage;

[Tags("FileStorage")]
public sealed class FileStorageService(
    IStorageService storageService,
    IUserContext userContext,
    IOptions<ChatOptions> options) : FastApi
{
    /// <summary>
    /// 上传文件
    /// </summary>
    [EndpointSummary("上传文件")]
    [Authorize]
    public async Task<string> UploadAsync(IFormFile file)
    {
        // 获取后缀名
        var ext = Path.GetExtension(file.FileName);
        var fileName = Guid.NewGuid().ToString("N") + ext;

        var path = await storageService.UploadFileAsync(fileName, file.OpenReadStream(), userContext.UserId);

        if (!string.IsNullOrEmpty(path))
        {
            return options.Value.App.TrimEnd('/') + "/api/FileStorage?id=" + path;
        }

        throw new BusinessException("上传失败");
    }

    /// <summary>
    /// 获取文件
    /// </summary>
    [EndpointSummary("获取文件")]
    [AllowAnonymous]
    public async Task GetAsync(string id, HttpContext context)
    {
        var stream = await storageService.GetFileAsync(id);

        if (stream.stream == null)
        {
            context.Response.StatusCode = 404;
            return;
        }

        var type = GetContentType(id);

        context.Response.ContentType = type;

        await stream.stream!.CopyToAsync(context.Response.Body);
    }

    /// <summary>
    /// 根据文件名称获取文件类型
    /// </summary>
    /// <returns></returns>
    private static string GetContentType(string fileName)
    {
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(fileName, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return contentType;
    }
}