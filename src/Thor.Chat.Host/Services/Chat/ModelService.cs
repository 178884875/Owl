using FastService;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;
using Thor.Chat.Host.Dto;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.Chat.Dto;

namespace Thor.Chat.Host.Services.Chat;

public class ModelService(IDbContext context, IMapper mapper) : FastApi
{
    /// <summary>
    /// 启用/禁用模型
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task EnableAsync(string id)
    {
        await context
            .Models.Where(x => x.Id == id)
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.Enabled, model => !model.Enabled));
    }

    /// <summary>
    /// 删除模型
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task DeleteAsync(string id)
    {
        await context
            .Models.Where(x => x.Id == id)
            .ExecuteDeleteAsync();
    }

    /// <summary>
    /// 获取所有模型
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task<List<ModelDto>> GetListAsync()
    {
        var models = await context.Models
            .ToListAsync();

        var values = mapper.Map<List<ModelDto>>(models);

        return values;
    }

    /// <summary>
    /// 更新模型
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task UpdateAsync(ModelDto dto)
    {
        var model = await context.Models.FirstOrDefaultAsync(x => x.Id == dto.Id);

        if (model == null)
        {
            throw new BusinessException("模型不存在");
        }

        mapper.Map(dto, model);

        context.Models.Update(model);

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// 修改模型
    /// </summary>
    public async Task<List<InitModelsDto>> GetModelsAsync()
    {
        var models = await context.Models
            .Where(x => x.Enabled == true)
            .ToListAsync();

        var modelsDto = new List<InitModelsDto>();

        foreach (var model in models)
        {
            // 判断是否已经存在当前提供商
            var modelDto = modelsDto.FirstOrDefault(x => x.Provider == model.Provider);
            if (modelDto == null)
            {
                modelsDto.Add(modelDto = new InitModelsDto()
                {
                    Provider = model.Provider,
                    ChatModels = new List<InitModelChatModels>()
                });
            }

            modelDto.ChatModels.Add(new InitModelChatModels()
            {
                ContextWindowTokens = model.ContextWindowTokens,
                Description = model.Description,
                DisplayName = model.DisplayName,
                Enabled = model.Enabled,
                Id = model.Id,
                ModelId = model.ModelId,
                MaxOutput = model.MaxOutput,
                Pricing = new InitModelPricing()
                {
                    CachedInput = model.Pricing.CachedInput,
                    Input = model.Pricing.Input,
                    Output = model.Pricing.Output,
                    WriteCacheInput = model.Pricing.WriteCacheInput,
                },
                ReleasedAt = model.ReleasedAt,
                Type = model.Type,
                Vision = model.Abilities.Vision,
                FunctionCall = model.Abilities.FunctionCall,
            });
        }

        return modelsDto;
    }
}