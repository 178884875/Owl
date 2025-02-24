namespace Thor.Chat.Core.Entities;

/// <summary>
/// 对话消息文本
/// </summary>
public sealed class MessageText : Entity<long>
{
    /// <summary>
    /// 消息Id
    /// </summary>
    public long MessageId { get; set; }

    /// <summary>
    /// 推理更新
    /// </summary>
    public string? ReasoningUpdate { get; set; } 

    /// <summary>
    /// 文本
    /// </summary>
    public string Text { get; set; } = null!;
    
    public Message Message { get; set; } = null!;
}