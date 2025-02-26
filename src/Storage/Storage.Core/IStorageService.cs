namespace Storage.Core;

public interface IStorageService: IDisposable
{
    /// <summary>
    /// 上传文件
    /// </summary>
    /// <param name="key"></param>
    /// <param name="stream"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    Task<string> UploadFileAsync(string key, Stream stream,string userId);

    /// <summary>
    /// 获取文件
    /// </summary>
    /// <param name="key"></param>
    /// <returns></returns>
    Task<(string fileName,Stream? stream)> GetFileAsync(string key);
}