using System.ComponentModel;
using FastService;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Thor.Chat.Core;
using Thor.Chat.Core.Entities;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Options;
using Thor.Chat.Host.Services.Chat.Dto;
using Thor.Chat.Host.Services.Chat.Input;

namespace Thor.Chat.Host.Services.Chat;

[Tags("Chat")]
[Authorize]
[Filter(typeof(ResultFilter))]
public class SessionService(
    IDbContext dbContext,
    IMapper mapper,
    IUserContext userContext,
    IOptions<ChatSessionOptions> sessionOptions) : FastApi
{
    /// <summary>
    /// 获取所有会话
    /// </summary>
    [EndpointSummary("获取所有会话")]
    public async Task<IEnumerable<SessionDto>> GetListAsync(string? search)
    {
        var sessions = await dbContext.Sessions
            .Where(x => x.CreatedBy == userContext.UserId && (string.IsNullOrEmpty(search) || x.Name.Contains(search)))
            .OrderByDescending(x=>x.Favorite)
            .ThenBy(x => x.CreatedAt)
            .ToListAsync();

        var dto = mapper.Map<IEnumerable<SessionDto>>(sessions);

        return dto;
    }
    
    /// <summary>
    /// 取消或者收藏会话
    /// </summary>
    /// <returns></returns>
    [EndpointSummary("取消或者收藏会话")]
    public async Task ToggleFavoriteAsync(long sessionId)
    {
        await dbContext.Sessions
            .Where(x => x.Id == sessionId && x.CreatedBy == userContext.UserId)
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.Favorite, a => !a.Favorite));
    }

    /// <summary>
    /// 根据Id获取会话
    /// </summary>
    [EndpointSummary("根据Id获取会话")]
    public async Task<Session> GetAsync(long id)
    {
        var session = await dbContext.Sessions
            .AsNoTracking()
            .Include(s => s.SessionGroup)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (session == null)
        {
            throw new BusinessException("会话不存在");
        }

        return session;
    }

    /// <summary>
    /// 创建新会话
    /// </summary>
    [EndpointSummary("创建新会话")]
    public async Task<Session> CreateAsync(CreateSessionInput sessionInput)
    {
        sessionInput.Avatar = "🧸";
        var session = mapper.Map<Session>(sessionInput);

        session.CreatedBy = userContext.UserId;
        session.CreatedAt = DateTime.Now;
        session.Model = sessionInput.ModelId;

        var model = await dbContext.Models
            .AsNoTracking()
            .Where(x => x.ModelId == sessionOptions.Value.RenameModel)
            .FirstOrDefaultAsync();

        session.RenameModel = model.Id;

        await dbContext.Sessions.AddAsync(session);
        await dbContext.SaveChangesAsync();

        return session;
    }

    /// <summary>
    /// 删除会话
    /// </summary>
    [EndpointSummary("删除会话")]
    public async Task DeleteAsync(long id)
    {
        await dbContext.Sessions
            .Where(s => s.Id == id && s.CreatedBy == userContext.UserId)
            .ExecuteDeleteAsync();

        // 删除会话的同时删除会话的所有消息
        await dbContext.Messages
            .Where(m => m.SessionId == id)
            .ExecuteDeleteAsync();
    }

    /// <summary>
    /// 获取所有会话组
    /// </summary>
    [EndpointSummary("获取所有会话组")]
    public async Task<IEnumerable<SessionGroupDto>> GetSessionGroupsAsync()
    {
        var sessionGroups = await dbContext.SessionGroups
            .Include(x => x.CreatedBy == userContext.UserId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();

        var dto = mapper.Map<IEnumerable<SessionGroupDto>>(sessionGroups);

        return dto;
    }

    /// <summary>
    /// 根据Id获取会话组
    /// </summary>
    [EndpointSummary("根据Id获取会话组")]
    public async Task<SessionGroup> GetSessionGroupAsync(string id)
    {
        var sessionGroup = await dbContext.SessionGroups
            .AsNoTracking()
            .FirstOrDefaultAsync(sg => sg.Id == id && sg.CreatedBy == userContext.UserId);

        if (sessionGroup == null)
        {
            throw new BusinessException("会话组不存在");
        }

        return sessionGroup;
    }

    /// <summary>
    /// 切换会话模型
    /// </summary>
    [EndpointSummary("切换会话模型")]
    public async Task SwitchModelAsync(long sessionId, string modelId)
    {
        await dbContext.Sessions
            .Where(s => s.Id == sessionId && s.CreatedBy == userContext.UserId)
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.Model, modelId));
    }

    /// <summary>
    /// 创建新会话组
    /// </summary>
    [EndpointSummary("创建新会话组")]
    public async Task<SessionGroup> CreateSessionGroupAsync(CreateSessionGroupInput sessionGroupDto)
    {
        var sessionGroup = mapper.Map<SessionGroup>(sessionGroupDto);

        sessionGroup.CreatedBy = userContext.UserId;
        sessionGroup.CreatedAt = DateTime.Now;

        await dbContext.SessionGroups.AddAsync(sessionGroup);
        await dbContext.SaveChangesAsync();

        return sessionGroup;
    }

    /// <summary>
    /// 删除会话组
    /// </summary>
    [EndpointSummary("删除会话组")]
    public async Task DeleteSessionGroupAsync(string id)
    {
        await dbContext.SessionGroups
            .Where(sg => sg.Id == id && sg.CreatedBy == userContext.UserId)
            .ExecuteDeleteAsync();
    }

    /// <summary>
    /// 更新会话
    /// </summary>
    [EndpointSummary("更新会话")]
    public async Task UpdateAsync(UpdateSessionInput sessionInput)
    {
        var session = await dbContext.Sessions
            .FirstOrDefaultAsync(x => x.Id == sessionInput.Id && x.CreatedBy == userContext.UserId);

        if (session == null)
        {
            throw new BusinessException("会话不存在");
        }

        await dbContext.Sessions
            .Where(x => x.Id == sessionInput.Id)
            .ExecuteUpdateAsync(x =>
                x.SetProperty(a => a.Description, sessionInput.Description)
                    .SetProperty(a => a.Avatar, sessionInput.Avatar)
                    .SetProperty(a => a.Favorite, sessionInput.Favorite)
                    .SetProperty(a => a.RenameModel, sessionInput.RenameModel)
                    .SetProperty(a => a.Temperature, sessionInput.Temperature)
                    .SetProperty(a=>a.System, sessionInput.System)
                    .SetProperty(a => a.MaxTokens, sessionInput.MaxTokens)
                    .SetProperty(a => a.TopP, sessionInput.TopP)
                    .SetProperty(a => a.FrequencyPenalty, sessionInput.FrequencyPenalty)
                    .SetProperty(a => a.PresencePenalty, sessionInput.PresencePenalty)
                    .SetProperty(a => a.SessionGroupId, sessionInput.SessionGroupId)
                    .SetProperty(a => a.HistoryMessagesCount, sessionInput.HistoryMessagesCount)
                    .SetProperty(a => a.Tags, sessionInput.Tags));
    }

    /// <summary>
    /// 清空会话历史消息
    /// </summary>
    [EndpointSummary("清空会话历史消息")]
    public async Task ClearHistoryMessagesAsync(long sessionId)
    {
        var messageIds = await dbContext.Messages
            .Where(m => m.SessionId == sessionId)
            .Select(m => m.Id)
            .ToListAsync();

        await dbContext.MessageFiles
            .Where(mf => messageIds.Contains(mf.MessageId))
            .ExecuteDeleteAsync();

        await dbContext.MessageModelUsages
            .Where(mmu => mmu.MessageId != null & messageIds.Contains(mmu.MessageId.Value))
            .ExecuteDeleteAsync();

        await dbContext.MessageTexts
            .Where(mt => messageIds.Contains(mt.MessageId))
            .ExecuteDeleteAsync();

        await dbContext.Messages
            .Where(m => m.SessionId == sessionId)
            .ExecuteDeleteAsync();
    }

    /// <summary>
    /// 获取最近的三条会话
    /// </summary>
    /// <returns></returns>
    public async Task<List<SessionDto>> GetRecentSessionsAsync()
    {
        var sessions = await dbContext.Sessions
            .Where(x => x.CreatedBy == userContext.UserId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(3)
            .ToListAsync();

        var dto = mapper.Map<List<SessionDto>>(sessions);

        return dto;
    }
}