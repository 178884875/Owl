using Microsoft.EntityFrameworkCore;
using Owl.Chat.Core;

namespace EntityFrameworkCore.Sqlite;

public class SqliteDbContext(DbContextOptions<SqliteDbContext> options, IUserContext userContext)
    : DbContextBase<SqliteDbContext>(options, userContext)
{
    public override async Task MigrateAsync()
    {
        await base.Database.MigrateAsync();

    }
}