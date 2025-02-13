using LiteDB;
using Microsoft.Extensions.DependencyInjection;
using Storage.Core;

namespace Storage.LiteDB.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddLiteDB(this IServiceCollection services)
    {
        services.AddSingleton<ILiteDatabase>((_ => new LiteDatabase("Filename=storage.db;connection=shared")));
        services.AddSingleton<IStorageService, LiteDBStorage>();
        return services;
    }
}