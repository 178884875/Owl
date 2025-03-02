using FastService;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Owl.Chat.Host.Dto;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Services.Chat.Dto;
using Thor.Chat.Core;
using Thor.Chat.Core.Entities;

namespace Owl.Chat.Host.Services.Chat;

[Filter(typeof(ResultFilter))]
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
    public async Task<List<object>> GetListAsync()
    {
        var models = await context.Models
            .ToListAsync();

        // 根据provider分组
        var group = models.GroupBy(x => x.Provider);

        var result = new List<object>();

        foreach (var item in group)
        {
            var provider = new
            {
                Provider = item.Key,
                Models = item.Select(x => new
                {
                    x.Id,
                    x.ModelId,
                    x.DisplayName,
                    x.Description,
                    x.Type,
                    x.ContextWindowTokens,
                    x.MaxOutput,
                    x.Enabled,
                    x.ReleasedAt,
                    x.Abilities,
                    x.Pricing,
                })
            };

            result.Add(provider);
        }

        return result;
    }

    /// <summary>
    /// 更新模型
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task UpdateAsync(ModelDto dto)
    {
        if (await context.Models.AnyAsync(x =>
                x.Id != dto.Id && x.Provider == dto.Provider && x.ModelId == dto.ModelId))
        {
            throw new BusinessException("模型已存在");
        }

        if (string.IsNullOrWhiteSpace(dto.ModelId))
        {
            throw new BusinessException("ModelId不能为空");
        }

        if (string.IsNullOrWhiteSpace(dto.DisplayName))
        {
            throw new BusinessException("DisplayName不能为空");
        }

        if (string.IsNullOrWhiteSpace(dto.Description))
        {
            throw new BusinessException("Description不能为空");
        }

        if (string.IsNullOrWhiteSpace(dto.Type))
        {
            throw new BusinessException("Type不能为空");
        }

        if (dto.ContextWindowTokens <= 0)
        {
            throw new BusinessException("ContextWindowTokens必须大于0");
        }

        if (dto.MaxOutput <= 0)
        {
            throw new BusinessException("MaxOutput必须大于0");
        }

        var model = await context.Models.FirstOrDefaultAsync(x => x.Id == dto.Id);

        if (model == null)
        {
            throw new BusinessException("模型不存在");
        }

        dto.Provider = model.Provider;

        mapper.Map(dto, model);

        context.Models.Update(model);

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// 获取可用模型列表
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

        // 将OpenAI排在第一个
        var openAi = modelsDto.FirstOrDefault(x => x.Provider == "OpenAI");

        if (openAi != null)
        {
            modelsDto.Remove(openAi);
            modelsDto.Insert(0, openAi);
        }

        return modelsDto;
    }

    [Authorize(Roles = "Admin")]
    public async Task CreateAsync(ModelDto dto)
    {
        if (await context.Models.AnyAsync(x => x.Provider == dto.Provider && x.ModelId == dto.ModelId))
        {
            throw new BusinessException("模型已存在");
        }

        // 校验数据
        if (string.IsNullOrWhiteSpace(dto.Provider))
        {
            throw new BusinessException("Provider不能为空");
        }

        if (string.IsNullOrWhiteSpace(dto.ModelId))
        {
            throw new BusinessException("ModelId不能为空");
        }

        if (string.IsNullOrWhiteSpace(dto.DisplayName))
        {
            throw new BusinessException("DisplayName不能为空");
        }

        if (string.IsNullOrWhiteSpace(dto.Description))
        {
            throw new BusinessException("Description不能为空");
        }

        if (string.IsNullOrWhiteSpace(dto.Type))
        {
            throw new BusinessException("Type不能为空");
        }

        if (dto.ContextWindowTokens <= 0)
        {
            throw new BusinessException("ContextWindowTokens必须大于0");
        }

        if (dto.MaxOutput <= 0)
        {
            throw new BusinessException("MaxOutput必须大于0");
        }


        var model = mapper.Map<Model>(dto);

        model.Id = Guid.NewGuid().ToString();

        await context.Models.AddAsync(model);

        await context.SaveChangesAsync();
    }
}