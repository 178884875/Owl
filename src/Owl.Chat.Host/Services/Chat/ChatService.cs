#pragma warning disable SKEXP0001
using System.ClientModel.Primitives;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using FastService;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Owl.Chat.Host.AI;
using Owl.Chat.Host.Dto;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Prompts;
using Owl.Chat.Host.Services.Chat.Input;
using Storage.Core;
using Owl.Chat.Core;
using Owl.Chat.Core.Entities;
using Owl.Chat.Host.Options;
using AudioContent = Microsoft.SemanticKernel.AudioContent;
using ImageContent = Microsoft.SemanticKernel.ImageContent;

#pragma warning disable SKEXP0001

namespace Owl.Chat.Host.Services.Chat;

[Tags("Chat")]
public sealed class ChatService(
    IDbContext dbContext,
    IUserContext userContext,
    IStorageService storageService,
    IMapper mapper,
    BingScraper bingScraper,
    ImageService imageService,
    DocumentToMarkdown converter,
    IOptions<ChatSessionOptions> chatSessionOption,
    ILogger<ChatService> logger)
    : FastApi
{
    /// <summary>
    /// think: 协议头
    /// </summary>
    public const string ThinkStart = "<think>";

    /// <summary>
    /// think: 协议尾
    /// </summary>
    public const string ThinkEnd = "</think>";

    private static readonly Dictionary<string, Dictionary<string, double>> ImageSizeRatios = new()
    {
        {
            "dall-e-2", new Dictionary<string, double>
            {
                { "256x256", 1 },
                { "512x512", 1.125 },
                { "1024x1024", 1.25 }
            }
        },
        {
            "dall-e-3", new Dictionary<string, double>
            {
                { "1024x1024", 1 },
                { "1024x1792", 2 },
                { "1792x1024", 2 }
            }
        },
        {
            "ali-stable-diffusion-xl", new Dictionary<string, double>
            {
                { "512x1024", 1 },
                { "1024x768", 1 },
                { "1024x1024", 1 },
                { "576x1024", 1 },
                { "1024x576", 1 }
            }
        },
        {
            "ali-stable-diffusion-v1.5", new Dictionary<string, double>
            {
                { "512x1024", 1 },
                { "1024x768", 1 },
                { "1024x1024", 1 },
                { "576x1024", 1 },
                { "1024x576", 1 }
            }
        },
        {
            "wanx-v1", new Dictionary<string, double>
            {
                { "1024x1024", 1 },
                { "720x1280", 1 },
                { "1280x720", 1 }
            }
        }
    };

    [Authorize]
    public async Task ChatCompleteAsync(HttpContext context, ChatCompleteInput input)
    {
        try
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

            messages.Reverse();

            if (input.SelectedUserPromptId != null)
            {
                var userPrompt = await dbContext.UserPrompts
                    .AsNoTracking()
                    .Where(x => x.Id == input.SelectedUserPromptId && x.UserId == userContext.UserId)
                    .FirstOrDefaultAsync();

                if (userPrompt != null && !string.IsNullOrEmpty(userPrompt.Prompt))
                {
                    messages.Insert(0, new Message()
                    {
                        Role = "user",
                        Texts = new List<MessageText>()
                        {
                            new()
                            {
                                Text = userPrompt.Prompt
                            }
                        }
                    });
                }
            }

            var first = true;
            var isThink = false;
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
                throw new BusinessException($"抱歉，当前模型:{model.DisplayName}没有可用的渠道，请前往渠道管理创建渠道");
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
                    var result = await bingScraper.ScrapeAsync(last.Texts.Last().Text);

                    if (result.Results.Count > 0)
                    {
                        // 整理成prompt
                        var prompt = new StringBuilder();
                        foreach (var item in result.Results)
                        {
                            prompt.AppendLine(item.Title);
                            prompt.AppendLine(item.Url);
                            prompt.AppendLine(item.Snippet);
                        }

                        var value =
                            BingPrompt.Search.Replace("{{$searchResult}}", prompt.ToString());

                        requestToken += TokenHelper.GetTokens(value);

                        history.AddMessage(new AuthorRole("user"), value);


                        context.Response.Headers.ContentType = "text/event-stream";
                        context.Response.Headers.CacheControl = "no-cache";
                        context.Response.Headers.Connection = "keep-alive";

                        first = false;

                        // 发送搜索结果
                        await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
                        {
                            data = result.Results,
                            type = "search",
                        }, JsonOptions.DefaultJsonSerializerOptions) + "\n\n");

                        // 更新message
                        await dbContext.MessageTexts.Where(x => x.Id == input.AssistantMessageId)
                            .ExecuteUpdateAsync(x =>
                                x.SetProperty(a => a.SearchResults,
                                    x => mapper.Map<List<SearchResult>>(result.Results)));
                    }
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
                                var imageContent = new ImageContent(image.ToArray(), "image/jpeg");
                                var (token, error) = CountImageTokens(imageContent, "high");
                                requestToken += token;
                                history.AddMessage(new AuthorRole(message.Role), new ChatMessageContentItemCollection()
                                {
                                    imageContent
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
                                    history.AddUserMessage(
                                        converter.ConvertPdfToMarkdown(pdf, ref requestToken, file.FileName));
                                }
                                else if (file.FileName.EndsWith(".word") || file.FileName.EndsWith(".docx") ||
                                         file.FileName.EndsWith(".doc"))
                                {
                                    using var word = new MemoryStream();
                                    await stream.CopyToAsync(word);
                                    word.Position = 0;
                                    history.AddUserMessage(
                                        converter.ConvertWordToMarkdown(word, ref requestToken, file.FileName));
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

            //计算输入额度

            decimal quota = 0;
            if (model.Pricing is { Input: not null })
            {
                quota = (decimal)(requestToken * model.Pricing.Input ?? 0);
            }

            if (channelShareUsers.Any(x => x == channel.Id))
            {
                var channelShareUser = await dbContext.ModelChannelShareUsers
                    .AsNoTracking()
                    .Where(x => x.ChannelId == channel.Id && x.UserId == userContext.UserId && x.Enabled)
                    .FirstOrDefaultAsync();

                if (channelShareUser == null)
                {
                    throw new BusinessException("当前用户不存在当前模型类型的渠道");
                }

                // 如果是-1 则不限制
                if (channelShareUser.Quota != -1 && channelShareUser.Quota < quota)
                {
                    throw new NotSufficientFundsException("当前分享渠道账号余额不足");
                }
            }

            // 调用ChatComplete
            var chat = kernel.GetRequiredService<IChatCompletionService>();

            var sw = Stopwatch.StartNew();
            var sb = new StringBuilder();
            var reasoningUpdateSb = new StringBuilder();
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
                }

                if (item.InnerContent is StreamingFunctionCallUpdateContent functionCallUpdateContent)
                {
                    await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
                    {
                        data = functionCallUpdateContent,
                        type = "function",
                    }, JsonOptions.DefaultJsonSerializerOptions) + "\n\n");
                }
                else
                {
                    var jsonContent = JsonNode.Parse(ModelReaderWriter.Write(item.InnerContent!));

                    // 判断jsonContent["choices"]索引是=0
                    if (jsonContent["choices"].AsArray().Count == 0)
                    {
                        continue;
                    }

                    // 如果存在reasoning_content则说明是推理
                    if (jsonContent!["choices"]![0]!["delta"]!["reasoning_content"] != null)
                    {
                        var reasoningUpdate = jsonContent!["choices"]![0]!["delta"]!["reasoning_content"];
                        reasoningUpdateSb.Append(reasoningUpdate);
                        await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
                        {
                            data = reasoningUpdate,
                            type = "reasoning",
                        }, JsonOptions.DefaultJsonSerializerOptions) + "\n\n");
                    }
                    else
                    {
                        #region 解析内容中的think协议

                        if (first && item.ToString().Equals(ThinkStart, StringComparison.OrdinalIgnoreCase))
                        {
                            isThink = true;
                            continue;
                        }

                        if (item.ToString().Equals(ThinkEnd, StringComparison.OrdinalIgnoreCase))
                        {
                            isThink = false;
                            continue;
                        }

                        if (isThink)
                        {
                            reasoningUpdateSb.Append(item);
                            await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
                            {
                                data = item,
                                type = "reasoning",
                            }, JsonOptions.DefaultJsonSerializerOptions) + "\n\n");
                            continue;
                        }

                        #endregion

                        sb.Append(item);
                        await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
                        {
                            data = item.ToString(),
                            type = "chat",
                        }, JsonOptions.DefaultJsonSerializerOptions) + "\n\n");
                    }
                }

                first = false;
            }

            sw.Stop();
            completeTokens = TokenHelper.GetTokens(sb.ToString());
            completeTokens += TokenHelper.GetTokens(reasoningUpdateSb.ToString());
            var modelUsage = new MessageModelUsage()
            {
                MessageId = input.AssistantMessageId,
                SessionId = input.SessionId,
                CompleteTokens = completeTokens,
                PromptTokens = requestToken,
                ResponseTime = (int)sw.ElapsedMilliseconds
            };

            await context.Response.WriteAsync("data: " + JsonSerializer.Serialize(new
            {
                data = modelUsage,
                type = "model_usage",
            }, JsonOptions.DefaultJsonSerializerOptions) + "\n\n");
            await context.Response.WriteAsync("data: [done]" + "\n\n");

            await context.Response.CompleteAsync();

            await dbContext.MessageTexts.Where(x => x.Id == input.AssistantMessageId)
                .ExecuteUpdateAsync(x =>
                    x.SetProperty(a => a.Text, x => sb.ToString())
                        .SetProperty(a => a.ReasoningUpdate, x => reasoningUpdateSb.ToString()));

            await dbContext.MessageModelUsages.Where(x => x.MessageId == input.AssistantMessageId).ExecuteDeleteAsync();

            await dbContext.MessageModelUsages.AddAsync(modelUsage);

            await dbContext.SaveChangesAsync();

            // 更新渠道的最后使用时间
            await dbContext.ModelChannels.Where(x => x.Id == channel.Id)
                .ExecuteUpdateAsync(x => x.SetProperty(a => a.RequestCount, a => a.RequestCount + 1)
                    .SetProperty(a => a.TokenCost, a => a.TokenCost + requestToken + completeTokens));

            var userChatMessage = new ChatMessage
            {
                ChannelId = channel.Id,
                SessionId = input.SessionId,
                Role = "user",
                Content = messages.Last(x => x.Role == "user").Texts.Last(x => !string.IsNullOrEmpty(x.Text)).Text,
                PromptTokens = requestToken,
                Files = messages.Last(x => x.Role == "user").Files.Select(x => x.FileId).ToList(),
                CompleteTokens = completeTokens,
                ResponseTime = (int)sw.ElapsedMilliseconds,
                ModelId = model.Id
            };

            // 创建记录
            var chatMessage = new ChatMessage
            {
                ChannelId = channel.Id,
                SessionId = input.SessionId,
                Role = "assistant",
                Content = sb.ToString(),
                PromptTokens = requestToken,
                CompleteTokens = completeTokens,
                ResponseTime = (int)sw.ElapsedMilliseconds,
                ModelId = model.Id
            };

            // 计算完成额度
            if (model.Pricing is { Output: not null })
            {
                quota += (decimal)(completeTokens * model.Pricing.Output ?? 0);
            }

            quota = Math.Round(quota, 0, MidpointRounding.AwayFromZero);

            if (channelShareUsers.Any(x => x == channel.Id))
            {
                chatMessage.ShareId = channel.Id;
                userChatMessage.ShareId = channel.Id;

                // 更新渠道的最后使用时间
                await dbContext.ModelChannelShareUsers
                    .Where(x => x.ChannelId == channel.Id && x.UserId == userContext.UserId)
                    .ExecuteUpdateAsync(x =>
                        x.SetProperty(a => a.LastUsedAt, a => DateTime.Now)
                            .SetProperty(a => a.RequestCount, a => a.RequestCount + 1)
                            .SetProperty(a => a.TokenCount, a => a.TokenCount + requestToken + completeTokens)
                            .SetProperty(a => a.Quota, a => a.Quota - quota));
            }


            await dbContext.ChatMessages.AddAsync(chatMessage);

            await dbContext.ChatMessages.AddAsync(userChatMessage);

            await dbContext.SaveChangesAsync();
        }
        catch (Exception e)
        {
            context.Response.StatusCode = 500;
            logger.LogError("对话失败" + e.ToString());
            await context.Response.WriteAsJsonAsync(ResultDto.FailResult("对话失败" + e.Message));

            await dbContext.MessageTexts.Where(x => x.Id == input.AssistantMessageId)
                .ExecuteUpdateAsync(x =>
                    x.SetProperty(a => a.Text, x => "抱歉，服务发生异常，请稍后在试！"));
        }
    }


    /// <summary>
    /// 计算图片倍率
    /// </summary>
    /// <param name="model"></param>
    /// <param name="size"></param>
    /// <returns></returns>
    private static decimal GetImageSizeRatio(string model, string size)
    {
        if (!ImageSizeRatios.TryGetValue(model, out var ratios)) return 1;

        if (ratios.TryGetValue(size, out var ratio)) return (decimal)ratio;

        return 1;
    }

    /// <summary>
    /// 计算图片token
    /// </summary>
    /// <param name="image"></param>
    /// <param name="detail"></param>
    /// <returns></returns>
    private Tuple<int, Exception?> CountImageTokens(ImageContent image, string detail)
    {
        var fetchSize = true;
        int width = 0, height = 0;
        var lowDetailCost = 20; // Assuming lowDetailCost is 20
        var highDetailCostPerTile = 100; // Assuming highDetailCostPerTile is 100
        var additionalCost = 50; // Assuming additionalCost is 50

        if (string.IsNullOrEmpty(detail) || detail == "auto") detail = "high";

        switch (detail)
        {
            case "low":
                return new Tuple<int, Exception>(lowDetailCost, null);
            case "high":
                if (fetchSize)
                    try
                    {
                        (width, height) = imageService.GetImageSize(image.Data.Value);
                    }
                    catch (Exception e)
                    {
                        return new Tuple<int, Exception>(0, e);
                    }

                if (width > 2048 || height > 2048)
                {
                    var ratio = 2048.0 / Math.Max(width, height);
                    width = (int)(width * ratio);
                    height = (int)(height * ratio);
                }

                if (width > 768 && height > 768)
                {
                    var ratio = 768.0 / Math.Min(width, height);
                    width = (int)(width * ratio);
                    height = (int)(height * ratio);
                }

                var numSquares = (int)Math.Ceiling((double)width / 512) * (int)Math.Ceiling((double)height / 512);
                var result = numSquares * highDetailCostPerTile + additionalCost;
                return new Tuple<int, Exception>(result, null);
            default:
                return new Tuple<int, Exception>(0, new Exception("Invalid detail option"));
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

        Model? model;

        if (string.IsNullOrEmpty(session.RenameModel))
        {
            // 获取当前会话模型属于的模型
            model = await dbContext.Models
                .AsNoTracking()
                .Where(x => x.ModelId == session.RenameModel)
                .FirstOrDefaultAsync();
        }
        else
        {
            model = await dbContext.Models
                .AsNoTracking()
                .Where(x => x.Id == session.Model)
                .FirstOrDefaultAsync();
        }

        if (model == null)
        {
            throw new BusinessException("抱歉，您并没有可用的模型");
        }


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
            throw new BusinessException($"抱歉，当前模型:{model.DisplayName}没有可用的渠道，请前往渠道管理创建渠道");
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

        var result = await kernel.InvokeAsync(kernel.Plugins["Chat"]["TopicNaming"], new KernelArguments()
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