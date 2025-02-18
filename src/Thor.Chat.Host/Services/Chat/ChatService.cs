using FastService;
using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;
using Thor.Chat.Core.Entities;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Services.Chat.Input;

namespace Thor.Chat.Host.Services.Chat;

public sealed class ChatService(IDbContext dbContext, IUserContext userContext) : FastApi
{
    public async Task ChatCompleteAsync(HttpContext context, ChatCompleteInput input)
    {
        var session = await dbContext.Sessions.Where(x => x.Id == input.SessionId)
            .FirstOrDefaultAsync();

        List<Message> messages;

        if (session.HistoryMessagesCount <= 0)
        {
            messages = await dbContext.Messages.Where(x => x.SessionId == input.SessionId)
                .OrderByDescending(x => x.CreatedAt)
                .Include(x => x.Files)
                .Include(x => x.Texts)
                .ToListAsync();
        }
        else
        {
            messages = await dbContext.Messages
                .Where(x => x.SessionId == input.SessionId)
                .OrderByDescending(x => x.CreatedAt)
                .Take(session.HistoryMessagesCount)
                .Include(x => x.Files)
                .Include(x => x.Texts)
                .ToListAsync();
        }

        // 获取当前会话模型属于的模型
        var model = await dbContext.Models
            .AsNoTracking()
            .Where(x => x.Id == session.Model)
            .FirstOrDefaultAsync();

        // 获取当前用户是否存在当前模型类型的渠道
        var channelShareUsers = await dbContext.ModelChannelShareUsers
            .AsNoTracking()
            .Where(x => x.UserId == userContext.UserId && x.Enabled)
            .Select(x => x.ChannelId)
            .ToListAsync();

        var channels = await dbContext.ModelChannels
            .AsNoTracking()
            .Where(x => channelShareUsers.Contains(x.Id) ||
                        x.CreatedBy == userContext.UserId && x.ModelIds.Contains(model.ModelId))
            .OrderByDescending(x => x.CreatedAt)
            .ToArrayAsync();

        if (channels.Length == 0)
        {
            throw new BusinessException("当前用户不存在当前模型类型的渠道");
        }

        // 根据权重分配Key
        var (channel, key) = GetChannelKey(channels);
        
        
    }

    /// <summary>
    /// 根据权重分配渠道和渠道的一个Key
    /// </summary>
    /// <returns></returns>
    private static (ModelChannel, string) GetChannelKey(params ModelChannel[] channels)
    {
        var totalWeight = channels.Sum(c => c.Keys.Sum(k => k.Order));
        var randomWeight = new Random().Next(0, totalWeight);
        var currentWeight = 0;

        foreach (var channel in channels)
        {
            foreach (var key in channel.Keys)
            {
                currentWeight += key.Order;
                if (currentWeight >= randomWeight)
                {
                    return (channel, key.Key);
                }
            }
        }

        throw new InvalidOperationException("No key found for the given channels.");
    }
}