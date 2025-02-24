using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using DocumentConverter;
using FastService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Storage.Core;
using Thor.Chat.Core;
using Thor.Chat.Core.Entities;
using Thor.Chat.Host.AI;
using Thor.Chat.Host.Dto;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.Chat.Input;

#pragma warning disable SKEXP0001

namespace Thor.Chat.Host.Services.Chat;

public sealed class ChatService(
    IDbContext dbContext,
    IUserContext userContext,
    IStorageService storageService,
    ILogger<ChatService> logger)
    : FastApi
{
    [Authorize]
    public async Task ChatCompleteAsync(HttpContext context, ChatCompleteInput input)
    {
        try
        {
            var converter = new DocumentToMarkdown(imageOutputPath: "output/images");

            var session = await dbContext.Sessions.Where(x => x.Id == input.SessionId)
                .FirstOrDefaultAsync();

            List<Message> messages;

            if (session.HistoryMessagesCount <= 0)
            {
                messages = await dbContext.Messages.Where(x => x.SessionId == input.SessionId)
                    .OrderByDescending(x => x.CreatedAt)
                    .Include(x => x.Files)
                    .Include(x => x.Texts)
                    .ToListAsync();
            }
            else
            {
                messages = await dbContext.Messages
                    .Where(x => x.SessionId == input.SessionId)
                    .OrderByDescending(x => x.CreatedAt)
                    .Take(session.HistoryMessagesCount)
                    .Include(x => x.Files)
                    .Include(x => x.Texts)
                    .ToListAsync();
            }

            messages.Reverse();

            // 获取当前会话模型属于的模型
            var model = await dbContext.Models
                .AsNoTracking()
                .Where(x => x.Id == session.Model)
                .FirstOrDefaultAsync();

            // 获取当前用户是否存在当前模型类型的渠道
            var channelShareUsers = await dbContext.ModelChannelShareUsers
                .AsNoTracking()
                .Where(x => x.UserId == userContext.UserId && x.Enabled)
                .Select(x => x.ChannelId)
                .ToListAsync();

            var channels = await dbContext.ModelChannels
                .AsNoTracking()
                .Where(x => channelShareUsers.Contains(x.Id) ||
                            x.CreatedBy == userContext.UserId)
                .OrderByDescending(x => x.CreatedAt)
                .ToArrayAsync();

            channels = channels.Where(x => x.ModelIds.Contains(session.Model)).ToArray();

            if (channels.Length == 0)
            {
                throw new BusinessException("当前用户不存在当前模型类型的渠道");
            }

            // 根据权重分配Key
            var (channel, key) = GetChannelKey(channels);

            var kernel = KernelFactory.CreateKernel(model.ModelId, channel.Endpoint, key, channel.Provider);

            var history = new ChatHistory();

            var requestToken = 0;
            var completeTokens = 0;

            if (input.Networking)
            {
                var last = messages.LastOrDefault(x => x.Role == "user");
                if (last != null)
                {
                    // 
                }
            }

            foreach (var message in messages)
            {
                if (message.Files.Count != 0)
                {
                    // 如果是文件则需要解析文件
                    foreach (var file in message.Files)
                    {
                        var fileEntity = await dbContext.FileStorages
                            .AsNoTracking()
                            .Where(x => x.Id == file.FileId)
                            .FirstOrDefaultAsync();

                        // 获取文件的内容
                        var (fileName, stream) = await storageService.GetFileAsync(fileEntity.ProviderId);

                        // 根据文件名获取文件类型
                        var type = GetFileType(file.FileName);
                        switch (type)
                        {
                            case "image":
                            {
                                using var image = new MemoryStream();
                                await stream.CopyToAsync(image);
                                image.Position = 0;
                                history.AddMessage(new AuthorRole(message.Role), new ChatMessageContentItemCollection()
                                {
                                    new ImageContent(image.ToArray(), "image/jpeg")
                                });
                                break;
                            }
                            case "audio":
                            {
                                using var audio = new MemoryStream();
                                await stream.CopyToAsync(audio);
                                history.AddMessage(new AuthorRole(message.Role),
                                    [new AudioContent(audio.ToArray(), "audio/mpeg")]);
                                break;
                            }

                            case "document":
                                // 如果的pdf或者word，可以读取
                                if (file.FileName.EndsWith(".pdf"))
                                {
                                    using var pdf = new MemoryStream();
                                    await stream.CopyToAsync(pdf);
                                    pdf.Position = 0;
                                    string markdownFromPdf = converter.ConvertPdfToMarkdown(pdf);

                                    markdownFromPdf = $"""
                                                       ```markdown {file.FileName}
                                                       {markdownFromPdf}
                                                       ```
                                                       """;

                                    requestToken += TokenHelper.GetTokens(markdownFromPdf);
                                    history.AddUserMessage(markdownFromPdf);
                                }

                                break;
                            case "markdown":
                                using (var reader = new StreamReader(stream))
                                {
                                    var content = $"""
                                                   ```markdown {file.FileName}
                                                   {await reader.ReadToEndAsync()}
                                                   ```
                                                   """;

                                    requestToken += TokenHelper.GetTokens(content);
                                    history.AddMessage(new AuthorRole(message.Role), content);
                                    break;
                                }
                            case "code":
                                // 如果是代码则直接添加到对话中
                                using (var reader = new StreamReader(stream))
                                {
                                    var content = $"""
                                                   ```{file.FileName.Split('.').LastOrDefault()} {file.FileName}
                                                   {await reader.ReadToEndAsync()}
                                                   ```
                                                   """;
                                    requestToken += TokenHelper.GetTokens(content);
                                    history.AddMessage(new AuthorRole(message.Role), content);
                                }

                                break;
                            case "file":
                                // TODO:不确定的文件类型暂时不处理

                                break;
                        }
                    }
                }

                if (message.Role == "assistant" && message.Texts.Any(x => x.Text == "..."))
                {
                    continue;
                }

                if (message.Texts.Count != 0)
                {
                    var text = message.Texts.LastOrDefault();
                    requestToken += TokenHelper.GetTokens(text.Text);
                    history.AddMessage(new AuthorRole(message.Role), text.Text);
                }
            }

            // 调用ChatComplete
            var chat = kernel.GetRequiredService<IChatCompletionService>();

            var sw = Stopwatch.StartNew();
            var first = true;
            var sb = new StringBuilder();
            await foreach (var item in chat.GetStreamingChatMessageContentsAsync(history,
                               new OpenAIPromptExecutionSettings()
                               {
                                   MaxTokens = session.MaxTokens,
                                   Temperature = session.Temperature,
                                   TopP = session.TopP,
                                   FrequencyPenalty = session.FrequencyPenalty,
                               }, kernel))
            {
                if (first)
                {
                    // 设置sse
                    context.Response.Headers.ContentType = "text/event-stream";
                    context.Response.Headers.CacheControl = "no-cache";
                    context.Response.Headers.Connection = "keep-alive";

                    first = false;
                }

                if (item.InnerContent is StreamingFunctionCallUpdateContent functionCallUpdateContent)
                {
                    await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
                    {
                        data = functionCallUpdateContent,
                        type = "function",
                    }) + "\n\n");
                }
                else
                {
                    sb.Append(item);
                    await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
                    {
                        data = item.ToString(),
                        type = "chat",
                    }) + "\n\n");
                }
            }

            await context.Response.WriteAsync("data: [done]" + Environment.NewLine);

            await context.Response.CompleteAsync();
            sw.Stop();

            completeTokens = TokenHelper.GetTokens(sb.ToString());

            await dbContext.MessageTexts.Where(x => x.Id == input.AssistantMessageId)
                .ExecuteUpdateAsync(x =>
                    x.SetProperty(a => a.Text, x => sb.ToString()));

            await dbContext.MessageModelUsages.Where(x => x.MessageId == input.AssistantMessageId).ExecuteDeleteAsync();

            await dbContext.MessageModelUsages.AddAsync(new MessageModelUsage()
            {
                MessageId = input.AssistantMessageId,
                SessionId = input.SessionId,
                CompleteTokens = completeTokens,
                ResponseTime = sw.Elapsed.Milliseconds,
            });

            // 更新渠道的最后使用时间
            await dbContext.ModelChannels.Where(x => x.Id == channel.Id)
                .ExecuteUpdateAsync(x => x.SetProperty(a => a.RequestCount, a => a.RequestCount + 1)
                    .SetProperty(a => a.TokenCost, a => a.TokenCost + requestToken + completeTokens));

            // 创建记录
        }
        catch (Exception e)
        {
            logger.LogError(e, "对话失败");
            await context.Response.WriteAsJsonAsync(ResultDto.FailResult("对话失败" + e.Message));
        }
    }

    /// <summary>
    /// 生成会话名称
    /// </summary>
    /// <param name="sessionId"></param>
    /// <returns></returns>
    [EndpointSummary("生成会话名称")]
    [Filter(typeof(ResultFilter))]
    [Authorize]
    public async Task<string> GenerateSessionNameAsync(long sessionId)
    {
        var session = await dbContext.Sessions
            .AsNoTracking()
            .Where(x => x.Id == sessionId)
            .FirstOrDefaultAsync();

        if (session == null)
        {
            throw new BusinessException("会话不存在");
        }

        var model = await dbContext.Models
            .AsNoTracking()
            .Where(x => x.Id == session.RenameModel)
            .FirstOrDefaultAsync();

        if (model == null)
        {
            throw new BusinessException("模型不存在");
        }

        var channelShareUsers = await dbContext.ModelChannelShareUsers
            .AsNoTracking()
            .Where(x => x.UserId == userContext.UserId && x.Enabled)
            .Select(x => x.ChannelId)
            .ToListAsync();

        var channels = await dbContext.ModelChannels
            .AsNoTracking()
            .Where(x => channelShareUsers.Contains(x.Id) ||
                        x.CreatedBy == userContext.UserId)
            .OrderByDescending(x => x.CreatedAt)
            .ToArrayAsync();

        channels = channels.Where(x => x.ModelIds.Contains(session.RenameModel)).ToArray();

        if (channels.Length == 0)
        {
            throw new BusinessException("当前用户不存在当前模型类型的渠道");
        }

        var (channel, key) = GetChannelKey(channels);

        // 读取这个会话的最新的俩条消息
        var messages = (await dbContext.Messages
            .Where(x => x.SessionId == sessionId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(2)
            .Include(x => x.Texts)
            .ToListAsync());

        if (messages.Count == 0)
        {
            throw new BusinessException("会话不存在消息");
        }

        messages.Reverse();

        var sb = new StringBuilder();

        foreach (var message in messages)
        {
            if (message.Texts.Count != 0)
            {
                var text = message.Texts.LastOrDefault();

                sb.AppendLine(message.Role + "：" + text.Text);
            }
        }

        var kernel = KernelFactory.CreateKernel(model.ModelId, channel.Endpoint, key, channel.Provider);

        var chatPlugin = kernel.Plugins["Chat"];

        var result = await kernel.InvokeAsync(chatPlugin["TopicNaming"], new KernelArguments()
        {
            ["content"] = sb.ToString(),
        });

        await dbContext.Sessions.Where(x => x.Id == sessionId)
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.Name, x => result.ToString()));

        return result.ToString();
    }

    /// <summary>
    /// 根据文件名获取文件类型
    /// </summary>
    /// <returns></returns>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static string GetFileType(string fileName)
    {
        var fileType = fileName.Split('.').LastOrDefault();

        if (fileType is "jpg" or "jpeg" or "png" or "gif")
        {
            return "image";
        }

        if (fileType is "mp4" or "avi" or "mov" or "rmvb")
        {
            return "video";
        }

        if (fileType is "mp3" or "wav" or "flac" or "ape")
        {
            return "audio";
        }

        if (fileType is "doc" or "docx" or "pdf")
        {
            return "document";
        }

        if (fileType is "md" or "txt")
        {
            return "markdown";
        }

        if (fileType is ".cs" or ".java" or ".py" or ".js" or ".ts" or ".html" or ".css" or ".json" or ".xml" or ".sql"
            or ".php" or ".go" or ".rb" or ".swift" or ".kt" or ".cpp" or ".c" or ".h" or ".hpp" or ".h" or ".m"
            or ".mm" or ".sh" or ".bat" or ".ps1" or ".psm1" or ".psd1" or ".ps1xml" or ".pssc" or ".cdxml" or ".xaml"
            or ".xamlx" or ".axaml")
        {
            return "code";
        }

        return "file";
    }

    /// <summary>
    /// 根据权重分配渠道和渠道的一个Key
    /// </summary>
    /// <returns></returns>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static (ModelChannel, string) GetChannelKey(params ModelChannel[] channels)
    {
        var totalWeight = channels.Sum(c => c.Keys.Sum(k => k.Order));
        var randomWeight = new Random().Next(0, totalWeight);
        var currentWeight = 0;

        foreach (var channel in channels)
        {
            foreach (var key in channel.Keys)
            {
                currentWeight += key.Order;
                if (currentWeight >= randomWeight)
                {
                    return (channel, key.Key);
                }
            }
        }

        throw new InvalidOperationException("No key found for the given channels.");
    }
}