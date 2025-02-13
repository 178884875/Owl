using FastService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.StaticFiles;
using Storage.Core;
using Thor.Chat.Host.Infrastructure;

namespace Thor.Chat.Host.Services.FileStorage;

[Tags("FileStorage")]
public sealed class FileStorageService(IStorageService storageService, IUserContext userContext) : FastApi
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

        return path;
    }

    /// <summary>
    /// 获取文件
    /// </summary>
    [EndpointSummary("获取文件")]
    [AllowAnonymous]
    public async Task GetAsync(string path, HttpContext context)
    {
        var stream = await storageService.GetFileAsync(path);

        if (stream.stream == null)
        {
            context.Response.StatusCode = 404;
            return;
        }

        var type = GetContentType(path);

        context.Response.ContentType = type;

        await stream.stream!.CopyToAsync(context.Response.Body);
    }

    /// <summary>
    /// 根据文件名称获取文件类型
    /// </summary>
    /// <returns></returns>
    public static string GetContentType(string fileName)
    {
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(fileName, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return contentType;
    }
}