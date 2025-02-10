using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core.Entities;

namespace Thor.Chat.Core;

/// <summary>
/// EfCore基类
/// </summary>
public abstract class DbContextBase<TDbContext>(DbContextOptions<TDbContext> options)
    : DbContext(options), IDbContext where TDbContext : DbContext
{
    public DbSet<User> Users { get; }

    public DbSet<UserOAuth> UserOAuths { get; }

    public DbSet<Session> Sessions { get; }

    public DbSet<SessionGroup> SessionGroups { get; }

    public DbSet<MessageText> MessageTexts { get; }

    public DbSet<MessageFile> MessageFiles { get; }

    public DbSet<MessageModelUsage> MessageModelUsages { get; }

    public DbSet<Message> Messages { get; }

    public DbSet<FileStorage> FileStorages { get; }

    public async Task SaveChangesAsync()
    {
        await SaveChangesAsync(new CancellationToken());
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseEntityConfiguration();

        base.OnModelCreating(modelBuilder);
    }
}