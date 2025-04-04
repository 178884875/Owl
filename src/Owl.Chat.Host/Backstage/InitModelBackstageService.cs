using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Owl.Chat.Host.Dto;
using Owl.Chat.Core;
using Owl.Chat.Core.Entities;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Services.User;

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
        await Task.Run((async () =>
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
                var userService = scope.ServiceProvider.GetService<UserService>();

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

                    await HandleAsync(dbContext, items, userService);

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
        }), stoppingToken);
    }

    /// <summary>
    /// 初始化渠道
    /// </summary>
    private async Task HandleAsync(IDbContext context, List<Model> items, UserService? userService)
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

        await userService.InitUserModelServiceAsync(user.Id, items, context, openAIEndpoint, openAIKey);
    }
}