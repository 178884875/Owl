using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Owl.Chat.Host.Backstage;
using Owl.Chat.Host.Converters;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Extensions;
using Owl.Chat.Core;

namespace Owl.Chat.Host;

public static class Program
{
    public static async Task Main(string[] args)
    {
        Launch.Initialize();
        
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddServices(builder.Configuration);

        builder.Services.AddSingleton<FileStaticMiddleware>();
        builder.Services.AddSingleton<GlobalMiddleware>();
        
        builder.Services.AddHttpClient();

        builder.Services.AddHttpClient("Authorize")
            .ConfigureHttpClient(((_, client) =>
            {
                client.DefaultRequestHeaders.Add("Accept", "application/json");
                client.DefaultRequestHeaders.Add("User-Agent", "ThorChat");
            }));

        builder.Services.AddHttpClient(nameof(BingScraper))
            .ConfigureHttpClient(((provider, client) =>
            {
                // 模仿浏览器请求，设置 User-Agent
                client.DefaultRequestHeaders.Add("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0");
                client.DefaultRequestHeaders.Add("x-client-data",
                    "eyIxIjoiMSIsIjIiOiIxIiwiMyI6IjAiLCI0IjoiMjgwNDcxNzQzOTQ1Mzc1MjUwMCIsIjYiOiJzdGFibGUiLCI5IjoiZGVza3RvcCJ9");
                client.DefaultRequestHeaders.Add("Accept",
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
                client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate, br");
                client.DefaultRequestHeaders.Add("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");
                client.DefaultRequestHeaders.Add("Cache-Control", "max-age=0");
                client.DefaultRequestHeaders.Add("Connection", "keep-alive");
                client.DefaultRequestHeaders.Add("Host", "www.bing.com");
                client.DefaultRequestHeaders.Add("Upgrade-Insecure-Requests", "1");
                client.DefaultRequestHeaders.Add("Referer", "https://www.bing.com/");
                client.DefaultRequestHeaders.Add("Sec-Fetch-Dest", "document");
                client.DefaultRequestHeaders.Add("Sec-Fetch-Mode", "navigate");
                client.DefaultRequestHeaders.Add("Sec-Fetch-Site", "none");
                client.DefaultRequestHeaders.Add("Sec-Fetch-User", "?1");
                client.DefaultRequestHeaders.Add("Sec-GPC", "1");
                client.DefaultRequestHeaders.Add("TE", "trailers");
                client.DefaultRequestHeaders.Add("sec-ch-ua",
                    "\"Not(A:Brand\";v=\"99\", \"Microsoft Edge\";v=\"133\", \"Chromium\";v=\"133\"");
                client.DefaultRequestHeaders.Add("sec-ch-ua-arch", "\"x86\"");
                client.DefaultRequestHeaders.Add("sec-ch-ua-bitness", "\"64\"");
                client.DefaultRequestHeaders.Add("sec-ch-ua-full-version", "\"133.0.3065.82\"");
                client.DefaultRequestHeaders.Add("sec-ch-ua-mobile", "?0");
                client.DefaultRequestHeaders.Add("sec-ch-ua-model", "\"\"");
                client.DefaultRequestHeaders.Add("sec-ch-ua-platform", "\"Windows\"");
                client.DefaultRequestHeaders.Add("sec-ch-ua-platform-version", "\"14.0.0\"");
                client.DefaultRequestHeaders.Add("sec-fetch-dest", "document");
                client.DefaultRequestHeaders.Add("sec-fetch-mode", "navigate");
                client.DefaultRequestHeaders.Add("sec-fetch-site", "cross-site");

                // 默认启用h2
                client.DefaultRequestVersion = HttpVersion.Version20;
                client.DefaultVersionPolicy = HttpVersionPolicy.RequestVersionOrHigher;
            }));

        builder.Services.ConfigureHttpJsonOptions((options =>
        {
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.SerializerOptions.Converters.Add(new JsonDateTimeConverter());
            options.SerializerOptions.Converters.Add(new JsonDateTimeOffsetConverter());
        }));

        builder.Services.AddHostedService<InitModelBackstageService>();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseMiddleware<GlobalMiddleware>();
        app.UseMiddleware<FileStaticMiddleware>();

        app.UseStaticFiles();

        app.MapMiniApis();

        // RunMigration
        var runMigration = builder.Configuration.GetValue<bool>("RunMigration");
        if (runMigration)
        {
            using var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IDbContext>();

            await dbContext.MigrateAsync();
            
        }

        await app.RunAsync();
    }
}