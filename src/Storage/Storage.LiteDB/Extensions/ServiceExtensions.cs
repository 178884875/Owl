using LiteDB;
using Microsoft.Extensions.DependencyInjection;
using Storage.Core;

namespace Storage.LiteDB.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddLiteDb(this IServiceCollection services)
    {
        services.AddSingleton<ILiteDatabase>((_ =>
        {
            var directory = new DirectoryInfo(Path.Combine(AppContext.BaseDirectory, "Storage"));

            if (directory.Exists == false)
            {
                directory.Create();
            }

            return new LiteDatabase(
                $"Filename={Path.Combine(directory.FullName, "fileStorage")}.db;Mode=Shared;Async=true");
        }));
        services.AddSingleton<IStorageService, LiteDBStorage>();
        return services;
    }
}