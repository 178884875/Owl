using FastService;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;
using Thor.Chat.Core.Entities;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.ModelChannels.Dto;
using Thor.Chat.Host.Services.ModelChannels.Input;

namespace Thor.Chat.Host.Services.ModelChannels;

[Filter(typeof(ResultFilter))]
public class ModelChannelService(IDbContext dbContext, IMapper mapper, IUserContext userContext) : FastApi
{
    [Authorize]
    public async Task<List<ModelChannelDto>> GetListAsync(string keyword)
    {
        var result = await dbContext.ModelChannels.Where(x =>
                (x.CreatedBy == userContext.UserId || x.ShareUsers.Any(x => x.UserId == userContext.UserId)) &&
                (string.IsNullOrEmpty(keyword) || x.Name.Contains(keyword) || x.Description.Contains(keyword)))
            .ToListAsync();

        var dto = mapper.Map<List<ModelChannelDto>>(result);

        return dto;
    }

    [Authorize]
    public async Task<ModelChannelDto> GetAsync(long id)
    {
        var result = await dbContext.ModelChannels
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Include(x => x.ShareUsers)
            .FirstOrDefaultAsync();

        // 如果不是创建人，但是属于共享列表，则清空敏感数据
        if (userContext.UserId != result.CreatedBy && result.ShareUsers.Any(x => x.UserId == userContext.UserId))
        {
            result.Keys = [];
            result.Endpoint = string.Empty;
        }
        else if (userContext.UserId != result.CreatedBy)
        {
            throw new UnauthorizedAccessException("当前用户没有权限访问");
        }

        var dto = mapper.Map<ModelChannelDto>(result);

        return dto;
    }

    /// <summary>
    /// 创建渠道
    /// </summary>
    [Authorize]
    public async Task CreateAsync(ModelChannelInput input)
    {
        var entity = mapper.Map<ModelChannel>(input);

        await dbContext.ModelChannels.AddAsync(entity);

        await dbContext.SaveChangesAsync();
    }

    [Authorize]
    public async Task UpdateAsync(long id, UpdateModelChannelInput input)
    {
        await dbContext.ModelChannels.Where(x => x.Id == id && x.CreatedBy == userContext.UserId)
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.Description, input.Description)
                .SetProperty(a => a.Name, input.Name)
                .SetProperty(a => a.Avatar, input.Avatar)
                .SetProperty(a => a.Endpoint, input.Endpoint)
                .SetProperty(a => a.Tags, input.Tags)
                .SetProperty(a => a.Provider, input.Provider)
                .SetProperty(a => a.ModelIds, input.ModelIds)
                .SetProperty(a => a.Keys, mapper.Map<List<ModelChannelKey>>(input.Keys))
                .SetProperty(a => a.Favorite, input.Favorite));
    }

    [Authorize]
    public async Task DeleteAsync(long id)
    {
        await dbContext.ModelChannels.Where(x => x.Id == id && x.CreatedBy == userContext.UserId)
            .ExecuteDeleteAsync();
    }
}