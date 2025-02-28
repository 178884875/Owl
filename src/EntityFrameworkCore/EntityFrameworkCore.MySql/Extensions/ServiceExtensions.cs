using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Thor.Chat.Core;

namespace EntityFrameworkCore.MySql.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddMySqlDbContext(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<IDbContext, MySqlDbContext>(((provider, builder) =>
        {
            builder.UseMySql(configuration.GetConnectionString("Default"), new MariaDbServerVersion("8.0.0"));
        }));

        return services;
    }
}