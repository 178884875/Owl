using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;

namespace EntityFrameworkCore.Sqlite;

public class SqliteDbContext(DbContextOptions<SqliteDbContext> options) : DbContextBase<SqliteDbContext>(options)
{
    
}