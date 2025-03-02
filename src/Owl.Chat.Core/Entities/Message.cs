namespace Thor.Chat.Core.Entities;

/// <summary>
/// 对话消息
/// </summary>
public sealed class Message : Entity<long>
{
    /// <summary>
    /// 会话Id
    /// 空=临时会话？
    /// </summary>
    public long? SessionId { get; set; }
    
    /// <summary>
    /// 创建角色
    /// </summary>
    public string Role { get; set; } = null!;

    /// <summary>
    /// 上级消息Id
    /// 可能是重新生成的消息
    /// </summary>
    public long? ParentId { get; set; }

    /// <summary>
    /// 分析会话Id
    /// </summary>
    public long? ShareId { get; set; }

    /// <summary>
    /// 对话文本
    /// </summary>
    public ICollection<MessageText> Texts { get; set; } = new List<MessageText>();

    /// <summary>
    /// 对话文件
    /// </summary>
    public ICollection<MessageFile> Files { get; set; } = new List<MessageFile>();
    
    /// <summary>
    /// 对话消息使用情况
    /// </summary>
    public MessageModelUsage? ModelUsages { get; set; }
    
    /// <summary>
    /// 异常信息
    /// </summary>
    public string? Error { get; set; }
}