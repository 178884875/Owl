using LiteDB;
using Storage.Core;

namespace Storage.LiteDB;

/// <summary>
/// LiteDB存储服务
/// </summary>
/// <param name="database"></param>
public sealed class LiteDBStorage(ILiteDatabase database) : IStorageService
{
    public Task<string> UploadFileAsync(string key, Stream stream, string userId)
    {
        var meta = new BsonDocument { { "UserId", userId } };
        database.FileStorage.Upload(key, key, stream, meta);

        return Task.FromResult(key);
    }

    public async Task<(string fileName, Stream? stream)> GetFileAsync(string key)
    {
        var file = database.FileStorage.FindById(key);

        if (file == null)
        {
            await Task.CompletedTask;
            return (string.Empty, null);
        }

        var stream = file.OpenRead();

        return (file.Filename, stream);
    }

    public void Dispose()
    {
        database.Dispose();
    }
}