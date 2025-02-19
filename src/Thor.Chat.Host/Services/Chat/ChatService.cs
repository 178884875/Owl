using System.Text.Json;
using FastService;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Storage.Core;
using Thor.Chat.Core;
using Thor.Chat.Core.Entities;
using Thor.Chat.Host.AI;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.Chat.Input;

namespace Thor.Chat.Host.Services.Chat;

public sealed class ChatService(IDbContext dbContext, IUserContext userContext, IStorageService storageService)
    : FastApi
{
    public async Task ChatCompleteAsync(HttpContext context, ChatCompleteInput input)
    {
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
                        x.CreatedBy == userContext.UserId && x.ModelIds.Contains(model.ModelId))
            .OrderByDescending(x => x.CreatedAt)
            .ToArrayAsync();

        if (channels.Length == 0)
        {
            throw new BusinessException("当前用户不存在当前模型类型的渠道");
        }

        // 根据权重分配Key
        var (channel, key) = GetChannelKey(channels);

        var kernel = KernelFactory.CreateKernel(model.ModelId, channel.Endpoint, key, channel.Provider);


        // 组成message 
        var history = new ChatHistory();

        foreach (var message in messages)
        {
            if (message.Files.Count != 0)
            {
                // 如果是文件则需要解析文件
                foreach (var file in message.Files)
                {
                    // 获取文件的内容
                    var (fileName, stream) = await storageService.GetFileAsync(file.FileId.ToString());

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
                                new ImageContent(image.ToArray(), null)
                            });
                            break;
                        }

                        case "video":
                            // history.AddMessage(new AuthorRole(message.Role), stream, ChatMessageType.Video);
                            break;
                        case "audio":
                        {
                            using var audio = new MemoryStream();
                            await stream.CopyToAsync(audio);
                            history.AddMessage(new AuthorRole(message.Role), new ChatMessageContentItemCollection()
                            {
                                new AudioContent(audio.ToArray(), null)
                            });
                            break;
                        }

                        case "document":
                            // TODO: 如果是文档则需要解析文档，暂时不处理

                            break;
                        case "markdown":
                            // 如果的markdown则直接添加到对话中
                            // 读取字符串
                            using (var reader = new StreamReader(stream))
                            {
                                var content = await reader.ReadToEndAsync();
                                history.AddMessage(new AuthorRole(message.Role), $@"
```markdown {file.FileName}
{content}
```
");
                                break;
                            }
                        case "code":
                            // 如果是代码则直接添加到对话中
                            using (var reader = new StreamReader(stream))
                            {
                                var content = await reader.ReadToEndAsync();

                                history.AddMessage(new AuthorRole(message.Role), $@"
```{file.FileName.Split('.').LastOrDefault()} {file.FileName}
{content}
```");
                            }

                            break;
                        case "file":
                            // TODO:不确定的文件类型暂时不处理

                            break;
                    }
                }
            }

            if (message.Texts.Count != 0)
            {
                var text = message.Texts.LastOrDefault();

                history.AddMessage(new AuthorRole(message.Role), text.Text);
            }
        }

        // 调用ChatComplete
        var chat = kernel.GetRequiredService<IChatCompletionService>();

        // 设置sse
        context.Response.Headers["Content-Type"] = "text/event-stream";
        context.Response.Headers["Cache-Control"] = "no-cache";
        context.Response.Headers["Connection"] = "keep-alive";

        await foreach (var item in chat.GetStreamingChatMessageContentsAsync(history,
                           new OpenAIPromptExecutionSettings()
                           {
                               MaxTokens = session.MaxTokens,
                               Temperature = session.Temperature,
                               TopP = session.TopP,
                               FrequencyPenalty = session.FrequencyPenalty,
                           }))
        {
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
                await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
                {
                    data = item.ToString(),
                    type = "chat",
                }) + "\n\n");
            }
        }

        await context.Response.WriteAsync("data: [done]" + Environment.NewLine);

        await context.Response.CompleteAsync();

        // 更新渠道的最后使用时间
        await dbContext.ModelChannels.Where(x => x.Id == channel.Id)
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.RequestCount, a => a.RequestCount + 1)
                .SetProperty(a => a.TokenCost, a => a.TokenCost + 1));

        // 创建记录
    }

    /// <summary>
    /// 根据文件名获取文件类型
    /// </summary>
    /// <returns></returns>
    private string GetFileType(string fileName)
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