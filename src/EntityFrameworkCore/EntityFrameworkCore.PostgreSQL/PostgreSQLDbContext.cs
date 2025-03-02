using Microsoft.EntityFrameworkCore;
using .Chat.Core;

namespace EntityFrameworkCore.PostgreSQL;

public class PostgreSQLDbContext(DbContextOptions<PostgreSQLDbContext> options, IUserContext userContext)
    : DbContextBase<PostgreSQLDbContext>(options, userContext)
{
    public override async Task MigrateAsync()
    {
        await base.Database.MigrateAsync();

    }
}