using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core.Entities;

namespace Thor.Chat.Core;

public interface IDbContext
{
    DbSet<User> Users { get; set; }

    DbSet<UserOAuth> UserOAuths { get; set; }

    DbSet<Session> Sessions { get; set; }

    DbSet<SessionGroup> SessionGroups { get; set; }

    DbSet<MessageText> MessageTexts { get; set; }

    DbSet<MessageFile> MessageFiles { get; set; }

    DbSet<MessageModelUsage> MessageModelUsages { get; set; }

    DbSet<Message> Messages { get; set; }

    DbSet<FileStorage> FileStorages { get; set; }

    DbSet<Model> Models { get; set; }

    DbSet<ModelChannel> ModelChannels { get; set; }

    DbSet<ModelChannelShareUser> ModelChannelShareUsers { get; set; }

    Task SaveChangesAsync();
}