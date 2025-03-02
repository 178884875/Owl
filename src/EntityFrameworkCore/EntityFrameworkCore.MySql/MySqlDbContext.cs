using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;

namespace EntityFrameworkCore.MySql;

public class MySqlDbContext(DbContextOptions<MySqlDbContext> options, IUserContext userContext)
    : DbContextBase<MySqlDbContext>(options, userContext)
{
    public override async Task MigrateAsync()
    {
        await base.Database.MigrateAsync();

    }
}