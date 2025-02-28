using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;

namespace EntityFrameworkCore.DaMeng;

public class DaMengDbContext(DbContextOptions<DaMengDbContext> options, IUserContext userContext)
    : DbContextBase<DaMengDbContext>(options, userContext)
{
}