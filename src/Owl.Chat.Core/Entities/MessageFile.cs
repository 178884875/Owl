namespace .Chat.Core.Entities;

/// <summary>
/// 消息中包含的文件
/// </summary>
public sealed class MessageFile : Entity<long>
{
    public long MessageId { get; set; }

    public string FileId { get; set; }

    public string FileName { get; set; } = null!;

    public long FileSize { get; set; }

    public string FileUrl { get; set; } = null!;
    
    public FileStorage FileStorage { get; set; } = null!;
    
    public Message Message { get; set; } = null!;
}