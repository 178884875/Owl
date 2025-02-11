namespace Thor.Chat.Host.Options;

public class ChatSessionOptions
{
    public const string Session = "Session";
    
    /// <summary>
    /// 会话默认模型
    /// </summary>
    public string? Model { get; set; }
}