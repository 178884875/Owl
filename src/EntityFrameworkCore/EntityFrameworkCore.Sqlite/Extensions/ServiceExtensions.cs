using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Thor.Chat.Core;

namespace EntityFrameworkCore.Sqlite.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddSqliteDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<IDbContext, SqliteDbContext>(((provider, builder) =>
        {
            builder.UseSqlite(configuration.GetConnectionString("Default"));
            
        }));

        return services;
    }
}