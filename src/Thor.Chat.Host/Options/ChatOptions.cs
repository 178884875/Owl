namespace Thor.Chat.Host.Options;

public class ChatOptions
{
    public const string Name = "Chat";
    
    /// <summary>
    /// 服务地址
    /// http://service:port
    /// </summary>
    public string? App { get; set; }
    
}