using Microsoft.EntityFrameworkCore;
using Owl.Chat.Core;

namespace EntityFrameworkCore.DaMeng;

public class DaMengDbContext(DbContextOptions<DaMengDbContext> options, IUserContext userContext)
    : DbContextBase<DaMengDbContext>(options, userContext)
{
    public override async Task MigrateAsync()
    {
        await base.Database.MigrateAsync();
    }
}