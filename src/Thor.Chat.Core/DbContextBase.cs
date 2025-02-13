using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core.Entities;

namespace Thor.Chat.Core;

/// <summary>
/// EfCore基类
/// </summary>
public abstract class DbContextBase<TDbContext>(DbContextOptions<TDbContext> options)
    : DbContext(options), IDbContext where TDbContext : DbContext
{
    public DbSet<User> Users { get; set; }

    public DbSet<UserOAuth> UserOAuths { get; set; }

    public DbSet<Session> Sessions { get; set; }

    public DbSet<SessionGroup> SessionGroups { get; set; }

    public DbSet<MessageText> MessageTexts { get; set; }

    public DbSet<MessageFile> MessageFiles { get; set; }

    public DbSet<MessageModelUsage> MessageModelUsages { get; set; }

    public DbSet<Message> Messages { get; set; }

    public DbSet<FileStorage> FileStorages { get; set; }

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