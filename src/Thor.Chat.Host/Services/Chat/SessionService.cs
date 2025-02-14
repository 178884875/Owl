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
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();

        var dto = mapper.Map<IEnumerable<SessionDto>>(sessions);

        return dto;
    }

    /// <summary>
    /// 根据Id获取会话
    /// </summary>
    [EndpointSummary("根据Id获取会话")]
    public async Task<Session> GetSessionAsync(long id)
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
    public async Task<Session> CreateSessionAsync(CreateSessionInput sessionInput)
    {
        var session = mapper.Map<Session>(sessionInput);

        session.CreatedBy = userContext.UserId;
        session.CreatedAt = DateTime.Now;
        session.Model = sessionOptions.Value.Model;

        await dbContext.Sessions.AddAsync(session);
        await dbContext.SaveChangesAsync();

        return session;
    }

    /// <summary>
    /// 删除会话
    /// </summary>
    [EndpointSummary("删除会话")]
    public async Task DeleteSessionAsync(long id)
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
}