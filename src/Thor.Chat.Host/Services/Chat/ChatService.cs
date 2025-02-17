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
        var channel = await dbContext.ModelChannelShareUsers
            .AsNoTracking()
            .Where(x => x.UserId == userContext.UserId)
            .FirstOrDefaultAsync();
    }
}