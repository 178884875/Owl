using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Owl.Chat.Core;

namespace EntityFrameworkCore.DaMeng.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddDaMengDbContext(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<IDbContext, DaMengDbContext>(((provider, builder) =>
        {
            builder.UseDm(configuration.GetConnectionString("Default")!);
            builder.EnableSensitiveDataLogging(false);
        }));

        return services;
    }
}