using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;

namespace EntityFrameworkCore.PostgreSQL;

public class PostgreSQLDbContext(DbContextOptions<PostgreSQLDbContext> options, IUserContext userContext)
    : DbContextBase<PostgreSQLDbContext>(options, userContext)
{
}