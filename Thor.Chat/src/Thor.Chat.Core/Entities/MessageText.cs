namespace Thor.Chat.Core.Entities;

/// <summary>
/// 对话消息文本
/// </summary>
public sealed class MessageText : Entity<long>
{
    public long MessageId { get; set; }

    public string Text { get; set; } = null!;
    
    public Message Message { get; set; } = null!;
}