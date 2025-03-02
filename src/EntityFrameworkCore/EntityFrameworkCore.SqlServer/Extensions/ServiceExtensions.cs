using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using .Chat.Core;

namespace EntityFrameworkCore.SqlServer.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddSqlServerDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<IDbContext, SqlServerDbContext>(((provider, builder) =>
        {
            builder.UseSqlServer(configuration.GetConnectionString("Default"));
        }));

        return services;
    }
}