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
    /// <summary>
    /// 获取存在的渠道列表
    /// </summary>
    /// <param name="keyword"></param>
    /// <returns></returns>
    [EndpointSummary("获取存在的渠道列表")]
    [Authorize]
    public async Task<List<ModelChannelDto>> GetListAsync(string keyword)
    {
        // 如果createdBy为空，则表示是系统创建的渠道
        var result = await dbContext.ModelChannels.Where(x =>
                (x.CreatedBy == null || x.CreatedBy == userContext.UserId || x.ShareUsers.Any(x => x.UserId == userContext.UserId)) &&
                (string.IsNullOrEmpty(keyword) || x.Name.Contains(keyword) || x.Description.Contains(keyword)))
            .ToListAsync();

        var dto = mapper.Map<List<ModelChannelDto>>(result);

        return dto;
    }

    [Authorize]
    [EndpointSummary("获取渠道详情")]
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
    [EndpointSummary("创建渠道")]
    public async Task CreateAsync(ModelChannelInput input)
    {
        var entity = mapper.Map<ModelChannel>(input);

        await dbContext.ModelChannels.AddAsync(entity);

        await dbContext.SaveChangesAsync();
    }

    [Authorize]
    [EndpointSummary("更新渠道")]
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
    [EndpointSummary("删除渠道")]
    public async Task DeleteAsync(long id)
    {
        await dbContext.ModelChannels.Where(x => x.Id == id && x.CreatedBy == userContext.UserId)
            .ExecuteDeleteAsync();
    }

    /// <summary>
    /// 创建渠道邀请码
    /// </summary>
    /// <returns></returns>
    [Authorize]
    [EndpointSummary("创建渠道邀请码")]
    public async Task<string> CreateInviteCodeAsync(CreateInviteCodeInput input)
    {
        var entity = await dbContext.ModelChannels
            .Where(x => x.Id == input.ChannelId && x.CreatedBy == userContext.UserId)
            .AnyAsync();

        if (entity)
        {
            throw new BusinessException("渠道不存在");
        }

        var inviteCode = new ModelChannelInviteCode()
        {
            ChannelId = input.ChannelId,
            Code = Guid.NewGuid().ToString("N"),
            CreatedAt = DateTime.Now,
            CreatedBy = userContext.UserId,
            MaxUseCount = input.MaxUseCount,
            ExpireTime = input.ExpireTime
        };

        await dbContext.ModelChannelInviteCodes.AddAsync(inviteCode);

        await dbContext.SaveChangesAsync();

        return inviteCode.Code;
    }

    /// <summary>
    /// 删除渠道邀请码
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [Authorize]
    [EndpointSummary("删除渠道邀请码")]
    public async Task DeleteInviteCodeAsync(long id)
    {
        await dbContext.ModelChannelInviteCodes
            .Where(x => x.Id == id && x.CreatedBy == userContext.UserId)
            .ExecuteDeleteAsync();
    }

    /// <summary>
    /// 加入渠道邀请
    /// </summary>
    /// <param name="code"></param>
    /// <returns></returns>
    [Authorize]
    [EndpointSummary("加入渠道邀请")]
    public async Task JoinInviteCodeAsync(string code)
    {
        var inviteCode = await dbContext.ModelChannelInviteCodes
            // 最大使用次数大于0或者无限制
            .Where(x => x.Code == code && x.ExpireTime > DateTime.Now && (x.MaxUseCount > 0 || x.MaxUseCount == -1))
            .FirstOrDefaultAsync();

        if (inviteCode == null)
        {
            throw new BusinessException("邀请码无效");
        }

        var entity = new ModelChannelShareUser()
        {
            ChannelId = inviteCode.ChannelId,
            UserId = userContext.UserId,
            CreatedAt = DateTime.Now,
            CreatedBy = userContext.UserId,
            Enabled = true,
        };

        await dbContext.ModelChannelShareUsers.AddAsync(entity);

        await dbContext.SaveChangesAsync();

        await dbContext.ModelChannelInviteCodes
            .Where(x => x.Id == inviteCode.Id)
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.MaxUseCount, a => a.MaxUseCount - 1));
    }

    /// <summary>
    /// 删除渠道共享
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [Authorize]
    [EndpointSummary("删除渠道共享")]
    public async Task DeleteShareUserAsync(long id)
    {
        await dbContext.ModelChannelShareUsers
            .Where(x => x.Id == id && x.CreatedBy == userContext.UserId)
            .ExecuteDeleteAsync();
    }

    /// <summary>
    /// 获取渠道共享列表
    /// </summary>
    /// <param name="channelId"></param>
    /// <returns></returns>
    [Authorize]
    [EndpointSummary("获取渠道共享列表")]
    public async Task<List<ModelChannelShareUserDto>> GetShareUserListAsync(long channelId)
    {
        var result = await dbContext.ModelChannelShareUsers
            .Where(x => x.ChannelId == channelId)
            .Include(x => x.User)
            .ToListAsync();

        var dto = mapper.Map<List<ModelChannelShareUserDto>>(result);

        return dto;
    }
}