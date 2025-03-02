using Microsoft.EntityFrameworkCore;
using .Chat.Core;

namespace EntityFrameworkCore.SqlServer;

public class SqlServerDbContext(DbContextOptions<SqlServerDbContext> options, IUserContext userContext)
    : DbContextBase<SqlServerDbContext>(options, userContext)
{
    public override async Task MigrateAsync()
    {
        await base.Database.MigrateAsync();

    }
}