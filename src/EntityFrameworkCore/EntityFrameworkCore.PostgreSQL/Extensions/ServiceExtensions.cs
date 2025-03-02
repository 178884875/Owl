using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Owl.Chat.Core;

namespace EntityFrameworkCore.PostgreSQL.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddPostgreSQLDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<IDbContext, PostgreSQLDbContext>(((provider, builder) =>
        {
            builder.UseNpgsql(configuration.GetConnectionString("Default"));
        }));

        return services;
    }
}