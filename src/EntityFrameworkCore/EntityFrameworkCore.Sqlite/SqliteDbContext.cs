using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;

namespace EntityFrameworkCore.Sqlite;

public class SqliteDbContext(DbContextOptions<SqliteDbContext> options, IUserContext userContext)
    : DbContextBase<SqliteDbContext>(options, userContext)
{
}