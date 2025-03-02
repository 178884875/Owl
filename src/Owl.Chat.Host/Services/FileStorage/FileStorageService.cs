using System.Web;
using FastService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Owl.Chat.Host.Dto;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Options;
using Owl.Chat.Host.Services.FileStorage.Dto;
using Storage.Core;
using Owl.Chat.Core;

namespace Owl.Chat.Host.Services.FileStorage;

[Tags("FileStorage")]
public sealed class FileStorageService(
    IStorageService storageService,
    IUserContext userContext,
    IDbContext dbContext,
    IOptions<ChatOptions> options) : FastApi
{
    /// <summary>
    /// 上传文件
    /// </summary>
    [EndpointSummary("上传文件")]
    [Authorize]
    public async Task<ResultDto> UploadAsync(HttpContext context)
    {
        var file = context.Request.Form.Files[0];
        // 获取后缀名
        var ext = Path.GetExtension(file.FileName);
        var fileName = Guid.NewGuid().ToString("N") + ext;

        var path = await storageService.UploadFileAsync(fileName, file.OpenReadStream(), userContext.UserId);

        var entity = dbContext.FileStorages.Add(new Owl.Chat.Core.Entities.FileStorage
        {
            FileName = file.FileName,
            Size = (int)file.Length,
            ContentType = file.ContentType,
            ProviderId = path
        }).Entity;

        await dbContext.SaveChangesAsync();

        if (!string.IsNullOrEmpty(path))
        {
            return new ResultDto()
            {
                Success = true,
                Data = new UploadDto
                {
                    Path = options.Value.App.TrimEnd('/') + "/api/FileStorage?id=" + path,
                    FileName = file.FileName,
                    Id = entity.Id
                }
            };
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
        var file = await dbContext.FileStorages.FirstOrDefaultAsync(x => x.Id == id);

        var stream = await storageService.GetFileAsync(file.ProviderId);

        if (stream.stream == null)
        {
            context.Response.StatusCode = 404;
            return;
        }

        var type = GetContentType(id);

        context.Response.ContentType = type;
        // 文件名
        // 文件名称乱码
        context.Response.Headers["Content-Disposition"] = $"attachment; filename={HttpUtility.UrlEncode(file.FileName)}";

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