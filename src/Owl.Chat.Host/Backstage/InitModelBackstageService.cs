using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Owl.Chat.Host.Dto;
using Owl.Chat.Core;
using Owl.Chat.Core.Entities;
using Owl.Chat.Host.Infrastructure;

namespace Owl.Chat.Host.Backstage;

/// <summary>
/// 初始化模型列表
/// </summary>
public sealed class InitModelBackstageService(
    IServiceProvider serviceProvider,
    ILogger<InitModelBackstageService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await using var scope = serviceProvider.CreateAsyncScope();

            var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Configs", "Models.json");

            if (!File.Exists(modelPath))
            {
                return;
            }

            var json = await File.ReadAllTextAsync(modelPath, stoppingToken);

            var models = JsonSerializer.Deserialize<InitModelsDto[]>(json,
                JsonOptions.DefaultJsonSerializerOptions);

            var dbContext = scope.ServiceProvider.GetService<IDbContext>();

            if (await dbContext!.Models.AnyAsync(cancellationToken: stoppingToken))
            {
                return;
            }
            else
            {
                var items = new List<Model>(models.SelectMany(x => x.Models).Count());

                foreach (var model in models)
                {
                    items.AddRange(model.Models.Select(chatModel => new Model()
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        ModelId = chatModel.Id,
                        ContextWindowTokens = chatModel.ContextWindowTokens,
                        Enabled = chatModel.Enabled,
                        DisplayName = chatModel.DisplayName,
                        Description = chatModel.Description,
                        Pricing = new Pricing()
                        {
                            Input = chatModel.Pricing?.Input,
                            Output = chatModel.Pricing?.Output,
                            WriteCacheInput = chatModel.Pricing?.WriteCacheInput,
                            AudioInput = chatModel.Pricing?.AudioInput,
                            AudioOutput = chatModel.Pricing?.AudioOutput,
                            CachedInput = chatModel.Pricing?.CachedInput,
                            CachedAudioInput = chatModel.Pricing?.CachedAudioInput,
                            Standard = chatModel.Pricing?.Standard
                        },
                        Type = chatModel.Type,
                        MaxOutput = chatModel.MaxOutput,
                        Provider = model.Provider,
                        ReleasedAt = chatModel.ReleasedAt,
                        CreatedAt = DateTime.Now,
                        Abilities =
                            new Abilities() { Vision = chatModel.Vision, FunctionCall = chatModel.FunctionCall },
                    }));
                }

                await dbContext.Models.AddRangeAsync(items, stoppingToken);

                await HandleAsync(dbContext, items);

                await dbContext.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while processing logs");
        }
        finally
        {
        }
    }

    /// <summary>
    /// 初始化渠道
    /// </summary>
    private async Task HandleAsync(IDbContext context, List<Model> items)
    {
        // 判断是否已经初始化
        if (await context.ModelChannels.AnyAsync())
        {
            return;
        }

        // 初始化用户
        var user = new User
        {
            Id = "F62438CE-D1FE-4183-91B4-409D6B45E7B9",
            UserName = "admin",
            PasswordHash = "4E71002969FCD46813B869E931AEDF4B",
            Email = "239573049@qq.com",
            Phone = "13049809673",
            Avatar = "https://avatars.githubusercontent.com/u/61819790?v=4",
            CreatedBy = string.Empty,
            Role = "Admin",
            DisplayName = "管理员",
            Enabled = true
        };

        await context.Users.AddAsync(user);

        await context.UserPrompts.AddRangeAsync(UserPrompt.CreateDefault(user.Id));

        // OpenAIEndpoint
        var openAIEndpoint = Environment.GetEnvironmentVariable("OpenAIEndpoint");
        var openAIKey = Environment.GetEnvironmentVariable("OpenAIKey");

        if (!string.IsNullOrEmpty(openAIEndpoint) && string.IsNullOrEmpty(openAIKey))
        {
            throw new BusinessException("OpenAIEndpoint和OpenAIKey必须同时设置");
        }

        await CreateChannelAsync(context, "OpenAI", "OpenAI", "OpenAI", openAIEndpoint ?? "https://api.openai.com/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "OpenAI", true, ["OpenAI", "官方"], user.Id, openAIKey);

        // 创建DeepSeek
        await CreateChannelAsync(context, "DeepSeek", "DeepSeek", "DeepSeek", "https://api.deepseek.com/v1",
            items.Where(x => x.Enabled == true && x.Provider.Equals("DeepSeek", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "DeepSeek", true, ["DeepSeek"], user.Id);

        // 创建google,使用OpenAI兼容接口
        await CreateChannelAsync(context, "Google", "Google", "Google",
            "https://generativelanguage.googleapis.com/v1beta/openai/",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Google", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Google", false, ["Google"], user.Id);

        await CreateChannelAsync(context, "Anthropic", "Anthropic", "Anthropic", "https://api.anthropic.com/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Anthropic", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Anthropic", false, ["Anthropic"], user.Id);

        await CreateChannelAsync(context, "SiliconCloud", "SiliconCloud", "SiliconCloud",
            "https://api.siliconcloud.com/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("SiliconCloud", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "SiliconCloud", false, ["SiliconCloud"], user.Id);

        await CreateChannelAsync(context, "GiteeAI", "GiteeAI", "GiteeAI", "https://api.gitee.com/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("GiteeAI", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "GiteeAI", false, ["GiteeAI"], user.Id);

        await CreateChannelAsync(context, "Grok", "Grok", "Grok", "https://api.token-ai.cn/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Grok", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Grok", false, ["Grok"], user.Id);
    }

    /// <summary>
    /// 创建渠道
    /// </summary>
    private static async Task CreateChannelAsync(IDbContext context, string name, string description, string avatar,
        string endpoint, List<string> modelIds, string provider, bool favorite, string[] tags, string userId,
        string? key = null)
    {
        var channel = new ModelChannel()
        {
            Name = name,
            Description = description,
            Avatar = avatar,
            Endpoint = endpoint,
            Enabled = true,
            ModelIds = modelIds,
            Provider = provider,
            Favorite = favorite,
            Available = true,
            Tags = tags,
            CreatedBy = userId,
        };

        if (!string.IsNullOrEmpty(key))
        {
            channel.Keys =
            [
                new()
                {
                    Key = key,
                    Description = "系统默认密钥",
                    Order = 999,
                }
            ];
        }

        await context.ModelChannels.AddAsync(channel);
    }
}