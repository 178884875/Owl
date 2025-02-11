using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core.Entities;

namespace Thor.Chat.Core;

public interface IDbContext
{
    DbSet<User> Users { get; }

    DbSet<UserOAuth> UserOAuths { get; }

    DbSet<Session> Sessions { get; }

    DbSet<SessionGroup> SessionGroups { get; }

    DbSet<MessageText> MessageTexts { get; }

    DbSet<MessageFile> MessageFiles { get; }

    DbSet<MessageModelUsage> MessageModelUsages { get; }

    DbSet<Message> Messages { get; }

    DbSet<FileStorage> FileStorages { get; }

    Task SaveChangesAsync();
}