using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;
using Thor.Chat.Core.Entities;
using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Service;

/// <summary>
/// 初始化模型列表
/// </summary>
public sealed class InitModelBackstageService(IServiceProvider serviceProvider) : BackgroundService
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

            var items = new List<Model>(models.SelectMany(x=>x.ChatModels).Count());

            foreach (var model in models)
            {
                items.AddRange(model.ChatModels.Select(chatModel => new Model()
                {
                    Id = Guid.NewGuid().ToString("N"),
                    ModelId = chatModel.Id,
                    ContextWindowTokens = chatModel.ContextWindowTokens,
                    Enabled = chatModel.Enabled,
                    DisplayName = chatModel.DisplayName,
                    Description = chatModel.Description,
                    Pricing = new Pricing() { Input = chatModel.Pricing?.Input, Output = chatModel.Pricing?.Output, },
                    Type = chatModel.Type,
                    MaxOutput = chatModel.MaxOutput,
                    Provider = model.Provider,
                    ReleasedAt = chatModel.ReleasedAt,
                    CreatedAt = DateTime.Now,
                    Abilities = new Abilities() { Vision = chatModel.Vision, FunctionCall = chatModel.FunctionCall },
                }));
            }

            await dbContext.Models.AddRangeAsync(items, stoppingToken);

            await dbContext.SaveChangesAsync();
        }
        finally
        {
        }
    }
}