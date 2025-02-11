using FastService;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;
using Thor.Chat.Core.Entities;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.Chat.Dto;
using Thor.Chat.Host.Services.Chat.Input;

namespace Thor.Chat.Host.Services.Chat;

[Tags("Chat")]
[Authorize]
public class MessageService(IDbContext dbContext, IUserContext userContext, IMapper mapper) : FastApi
{
    /// <summary>
    /// 获取所有消息
    /// </summary>
    [EndpointSummary("获取所有消息")]
    public async Task<IEnumerable<MessageDto>> GetListAsync(long sessionId, int? lastId)
    {
        var query = dbContext.Messages.AsQueryable();

        if (lastId.HasValue)
        {
            query = query.Where(x => x.Id < lastId);
        }

        query = query
            .Where(x => x.CreatedBy == userContext.UserId && x.SessionId == sessionId)
            .Include(x => x.Texts)
            .Include(x => x.Files)
            .Include(x => x.ModelUsages)
            .OrderByDescending(x => x.Id)
            .Take(20);

        var dto = mapper.Map<IEnumerable<MessageDto>>(await query.ToListAsync());

        return dto;
    }

    /// <summary>
    /// 根据Id获取消息
    /// </summary>
    /// <param name="id"></param>
    [EndpointSummary("根据Id获取消息")]
    public async Task<Message> GetAsync(long id)
    {
        var message = await dbContext.Messages
            .AsNoTracking()
            .Where(x => x.CreatedBy == userContext.UserId && x.Id == id)
            .FirstOrDefaultAsync();

        if (message == null)
        {
            throw new BusinessException("消息不存在");
        }

        return message;
    }

    /// <summary>
    /// 创建新消息
    /// </summary>
    /// <param name="message"></param>
    [EndpointSummary("创建新消息")]
    public async Task<Message> CreateAsync(CreateMessage message)
    {
        var value = mapper.Map<Message>(message);

        value.CreatedBy = userContext.UserId;
        value.CreatedAt = DateTime.Now;

        await dbContext.Messages.AddAsync(value);

        await dbContext.SaveChangesAsync();

        return value;
    }

    /// <summary>
    /// 删除消息
    /// </summary>
    /// <param name="id"></param>
    [EndpointSummary("删除消息")]
    public async Task DeleteAsync(long id)
    {
        await dbContext.Messages
            .Where(x => x.CreatedBy == userContext.UserId && x.Id == id)
            .ExecuteDeleteAsync();
    }
}