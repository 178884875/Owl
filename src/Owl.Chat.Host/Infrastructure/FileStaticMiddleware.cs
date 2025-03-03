namespace Owl.Chat.Host.Infrastructure;

public class FileStaticMiddleware : IMiddleware
{
    private static readonly string Version = typeof(FileStaticMiddleware).Assembly
        .GetName().Version?.ToString() ?? "1.0.0.0";
    
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (context.Request.Path == "/")
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
            if (File.Exists(path))
            {
                await context.Response.SendFileAsync(path);
                return;
            }
        }
        context.Response.Headers["Owl-Chat"] = Version;
        context.Response.Headers["AI-Gateway-Name"] = "Owl-Chat";

        if (context.Request.Path.Value?.EndsWith(".js") == true)
        {
            var path = context.Request.Path.Value;

            // 判断是否存在.br文件
            var brPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", path.TrimStart('/') + ".br");
            if (File.Exists(brPath))
            {
                context.Response.Headers.Append("Content-Encoding", "br");
                context.Response.Headers.Append("Content-Type", "application/javascript");
                
                // 缓存6小时
                context.Response.Headers.Append("Cache-Control", "public, max-age=21600");
                context.Response.Headers.Append("Expires", DateTime.UtcNow.AddHours(6).ToString("R"));

                await context.Response.SendFileAsync(brPath);

                return;
            }

            // 判断是否存在.gz文件
            var gzPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", path.TrimStart('/') + ".gz");
            if (File.Exists(gzPath))
            {
                context.Response.Headers.Append("Content-Encoding", "gzip");
                context.Response.Headers.Append("Content-Type", "application/javascript");
                context.Response.Headers.Append("Cache-Control", "public, max-age=21600");
                context.Response.Headers.Append("Expires", DateTime.UtcNow.AddHours(6).ToString("R"));
                await context.Response.SendFileAsync(gzPath);
                return;
            }
        }
        else if (context.Request.Path.Value?.EndsWith(".css") == true)
        {
            // 判断是否存在.br文件
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot",
                context.Request.Path.Value.TrimStart('/'));
            if (File.Exists(path))
            {
                context.Response.Headers.Append("Content-Type", "text/css");
                context.Response.Headers.Append("Cache-Control", "public, max-age=21600");
                context.Response.Headers.Append("Expires", DateTime.UtcNow.AddHours(6).ToString("R"));
                await context.Response.SendFileAsync(path);
                return;
            }
        }

        await next(context);

        if (context.Response.StatusCode == 404)
        {
            // 判断是否存在文件
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot",
                context.Request.Path.Value.TrimStart('/'));

            if (File.Exists(path))
            {
                context.Response.StatusCode = 200;
                context.Response.Headers.Append("Content-Type",
                    GetContentType(Path.GetExtension(path)));
                context.Response.Headers.Append("Cache-Control", "public, max-age=21600");
                context.Response.Headers.Append("Expires", DateTime.UtcNow.AddHours(6).ToString("R"));
                await context.Response.SendFileAsync(path);
                return;
            }

            // 返回index.html
            path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");

            if (File.Exists(path))
            {
                context.Response.StatusCode = 200;
                await context.Response.SendFileAsync(path);
                return;
            }
        }
    }


    public static string GetContentType(string extension)
    {
        return extension switch
        {
            ".html" => "text/html",
            ".htm" => "text/html",
            ".css" => "text/css",
            ".js" => "application/javascript",
            ".json" => "application/json",
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            ".ico" => "image/x-icon",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".ogg" => "video/ogg",
            ".mp3" => "audio/mp3",
            ".wav" => "audio/wav",
            ".webp" => "image/webp",
            ".woff" => "font/woff",
            ".woff2" => "font/woff2",
            ".ttf" => "font/ttf",
            ".eot" => "font/eot",
            ".otf" => "font/otf",
            ".pdf" => "application/pdf",
            ".zip" => "application/zip",
            ".rar" => "application/x-rar-compressed",
            ".7z" => "application/x-7z-compressed",
            ".txt" => "text/plain",
            ".csv" => "text/csv",
            ".xml" => "text/xml",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            _ => "application/octet-stream"
        };
    }
}