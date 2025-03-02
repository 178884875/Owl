using System.Diagnostics;
using FastService;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Owl.Chat.Host.AI;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Services.ModelChannels.Dto;
using Owl.Chat.Host.Services.ModelChannels.Input;
using .Chat.Core;
using .Chat.Core.Entities;

namespace Owl.Chat.Host.Services.ModelChannels;

[Filter(typeof(ResultFilter))]
public class ModelChannelService(
    IDbContext dbContext,
    IMapper mapper,
    IUserContext userContext,
    IHttpClientFactory httpClientFactory) : FastApi
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
        var channelIds = await dbContext.ModelChannelShareUsers
            .Where(x => x.UserId == userContext.UserId)
            .Select(x => x.ChannelId)
            .ToListAsync();

        var result = await dbContext.ModelChannels.Where(x =>
                (x.CreatedBy == userContext.UserId || channelIds.Contains(x.Id)) &&
                (string.IsNullOrEmpty(keyword) || x.Name.Contains(keyword) || x.Description.Contains(keyword)))
            .ToListAsync();

        var dto = mapper.Map<List<ModelChannelDto>>(result);

        foreach (var item in dto)
        {
            item.IsShare = channelIds.Contains(item.Id);

            if (!item.IsShare) continue;
            item.Keys = [];
            item.Endpoint = string.Empty;
            item.ShareUsers = [];
            item.RequestCount = 0;
            item.ResponseTime = 0;
            item.TokenCost = 0;
        }

        return dto;
    }

    [Authorize]
    [EndpointSummary("获取渠道详情")]
    public async Task<ModelChannelDto> GetAsync(long id)
    {
        var result = await dbContext.ModelChannels
            .AsNoTracking()
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync();

        if (userContext.UserId == result.CreatedBy)
        {
            // 查询共享用户
            var shareUsers = await dbContext.ModelChannelShareUsers
                .Where(x => x.ChannelId == id)
                .Include(x => x.User)
                .ToListAsync();

            result.ShareUsers = shareUsers;
        }

        var dto = mapper.Map<ModelChannelDto>(result);
        // 如果不是创建人，但是属于共享列表，则清空敏感数据
        if (userContext.UserId != result.CreatedBy)
        {
            var isShare =
                await dbContext.ModelChannelShareUsers.AnyAsync(
                    x => x.ChannelId == id && x.UserId == userContext.UserId);

            if (isShare)
            {
                dto.Keys = [];
                dto.Endpoint = string.Empty;
                dto.IsShare = true;
            }
            else
            {
                throw new UnauthorizedAccessException("当前用户没有权限访问");
            }
        }
        else if (userContext.UserId != result.CreatedBy)
        {
            throw new UnauthorizedAccessException("当前用户没有权限访问");
        }


        return dto;
    }

    /// <summary>
    /// 创建渠道
    /// </summary>
    [Authorize]
    [EndpointSummary("创建渠道")]
    public async Task CreateAsync(CreateModelChannelInput input)
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
                .SetProperty(a => a.Enabled, input.Enabled)
                .SetProperty(a => a.Favorite, input.Favorite));
    }

    [Authorize]
    [EndpointSummary("获取密钥")]
    public async Task<List<ModelChannelKey>> GetKeysAsync(long id)
    {
        var result = await dbContext.ModelChannels
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => x.Keys)
            .FirstOrDefaultAsync();

        // 将密钥脱敏
        result.ForEach(x => x.Key = x.Key.Substring(0, 4) + "****" + x.Key[^4..]);

        return result;
    }

    [Authorize]
    [EndpointSummary("测试渠道")]
    public async Task TestAsync(long id)
    {
        var channel = await dbContext.ModelChannels
            .AsNoTracking()
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync();

        if (channel == null)
        {
            throw new BusinessException("渠道不存在");
        }

        if (channel.Keys.Count == 0)
        {
            throw new BusinessException("请先添加密钥");
        }

        var modals = await dbContext.Models
            .AsNoTracking()
            .Where(x => channel.ModelIds.Contains(x.Id))
            .ToListAsync();

        if (modals.Count == 0)
        {
            throw new BusinessException("模型不存在");
        }

        string modal = "gpt-4o-mini";
        if (channel.Provider.Equals("openai", StringComparison.OrdinalIgnoreCase) &&
            modals.Any(x => x.ModelId.StartsWith("gpt-4o-mini", StringComparison.OrdinalIgnoreCase)))
        {
            modal = modals.First(x => x.ModelId.StartsWith("gpt-4o-mini", StringComparison.OrdinalIgnoreCase)).ModelId;
        }
        else if (channel.Provider.Equals("google", StringComparison.OrdinalIgnoreCase) && modals.Any(x =>
                     x.ModelId.StartsWith("gemini-1.5-flash", StringComparison.OrdinalIgnoreCase)))
        {
            modal = modals.First(x => x.ModelId.StartsWith("gemini-1.5-flash", StringComparison.OrdinalIgnoreCase))
                .ModelId;
        }
        else if (channel.Provider.Equals("deepseek", StringComparison.OrdinalIgnoreCase))
        {
            modal = "deepseek-chat";
        }

        if (string.IsNullOrEmpty(modal))
        {
            modal = modals.First(x => x.Type.Equals("chat", StringComparison.OrdinalIgnoreCase)).ModelId;
        }


        var kernel = KernelFactory.CreateKernel(modal, channel.Endpoint, channel.Keys.First().Key, channel.Provider);
        var sw = new Stopwatch();

        try
        {
            sw.Start();
            var response = await kernel.InvokePromptAsync("1+1=？请只输出结果");

            sw.Stop();

            if (string.IsNullOrEmpty(response.ToString()))
            {
                throw new BusinessException("测试失败");
            }

            // 记录测试日志
            await dbContext.ModelChannels.Where(x => x.Id == id).ExecuteUpdateAsync(x =>
                x.SetProperty(a => a.Available,
                        a => true)
                    .SetProperty(a => a.ResponseTime, a => sw.ElapsedMilliseconds));
        }
        catch (BusinessException e)
        {
            await dbContext.ModelChannels.Where(x => x.Id == id).ExecuteUpdateAsync(x =>
                x.SetProperty(a => a.Available, a => false)
                    .SetProperty(a => a.ResponseTime, a => sw.ElapsedMilliseconds));
            throw;
        }
        catch (Exception e)
        {
        }
        finally
        {
            sw.Stop();
        }
    }

    /// <summary>
    /// 更新密钥
    /// </summary>
    [Authorize]
    [EndpointSummary("更新密钥")]
    public async Task UpdateKeysAsync(long id, List<ModelChannelKey> keys)
    {
        await dbContext.ModelChannels.Where(x => x.Id == id && x.CreatedBy == userContext.UserId)
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.Keys, keys));
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

        if (!entity)
        {
            throw new BusinessException("渠道不存在");
        }

        var inviteCode = new ModelChannelInviteCode()
        {
            ChannelId = input.ChannelId,
            Code = Guid.NewGuid().ToString("N"),
            CreatedAt = DateTime.Now,
            CreatedBy = userContext.UserId,
            Inviter = userContext.UserId,
            MaxUseCount = input.MaxUseCount,
            ExpireTime = input.ExpireTime,
            Enabled = true,
        };

        await dbContext.ModelChannelInviteCodes.AddAsync(inviteCode);

        await dbContext.SaveChangesAsync();

        return inviteCode.Code;
    }

    [Authorize]
    [EndpointSummary("获取渠道邀请码列表")]
    public async Task<List<ModelChannelInviteCodeDto>> GetInviteCodeListAsync(long channelId)
    {
        var result = await dbContext.ModelChannelInviteCodes
            .Where(x => x.ChannelId == channelId && x.CreatedBy == userContext.UserId)
            .ToListAsync();

        var dto = mapper.Map<List<ModelChannelInviteCodeDto>>(result);

        return dto;
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

        if (await dbContext.ModelChannelShareUsers.AnyAsync(x =>
                x.ChannelId == inviteCode.ChannelId && x.UserId == userContext.UserId))
        {
            throw new BusinessException("已经加入过该渠道");
        }

        if (inviteCode.MaxUseCount > 0)
        {
            if (await dbContext.ModelChannelShareUsers
                    .Where(x => x.ChannelId == inviteCode.ChannelId)
                    .CountAsync() >= inviteCode.MaxUseCount)
            {
                throw new BusinessException("邀请码已达到最大使用次数");
            }
        }

        // 不能邀请自己
        if (inviteCode.Inviter == userContext.UserId)
        {
            throw new BusinessException("不能邀请自己");
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

    /// <summary>
    /// 禁用/启用渠道分享指定成员
    /// </summary>
    public async Task EnableShareUserAsync(long id)
    {
        var shared = await dbContext.ModelChannelShareUsers
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync();

        if (shared == null)
        {
            throw new BusinessException("共享用户不存在");
        }

        if (await dbContext.ModelChannels.AnyAsync(x => x.Id == shared.ChannelId && x.CreatedBy != userContext.UserId))
        {
            throw new BusinessException("没有权限操作");
        }
        
        shared.Enabled = !shared.Enabled;

        dbContext.ModelChannelShareUsers.Update(shared);
        
        await dbContext.SaveChangesAsync();
        
    }
}