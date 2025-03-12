using Microsoft.EntityFrameworkCore;
using Owl.Chat.Core.Entities;

namespace Owl.Chat.Core;

/// <summary>
/// EfCore基类
/// </summary>
public abstract class DbContextBase<TDbContext>(DbContextOptions<TDbContext> options, IUserContext userContext)
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

    public DbSet<Model> Models { get; set; }

    public DbSet<ChatMessage> ChatMessages { get; set; }

    public DbSet<ModelChannel> ModelChannels { get; set; }

    public DbSet<ModelChannelShareUser> ModelChannelShareUsers { get; set; }

    public DbSet<ModelChannelInviteCode> ModelChannelInviteCodes { get; set; }

    public DbSet<UserPrompt> UserPrompts { get; set; }

    public async Task SaveChangesAsync()
    {
        await SaveChangesAsync(new CancellationToken());
    }

    public virtual Task MigrateAsync()
    {
        return Task.CompletedTask;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseEntityConfiguration();

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        BeforeSaveChanges();

        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        BeforeSaveChanges();
        return base.SaveChanges();
    }

    private void BeforeSaveChanges()
    {
        var entries = ChangeTracker.Entries().Where(x =>
            x.Entity is ICreation && (x.State == EntityState.Added || x.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            if (entry is { State: EntityState.Added, Entity: ICreation entity })
            {
                entity.CreatedAt = DateTime.Now;

                if (string.IsNullOrEmpty(entity.CreatedBy) && userContext.IsAuthenticated)
                {
                    entity.CreatedBy = userContext.UserId;
                }
            }
        }
    }
}