namespace Owl.Chat.Host.Options;

public class ChatSessionOptions
{
    public const string Name = "Session";
    
    /// <summary>
    /// 会话默认模型
    /// </summary>
    public string? Model { get; set; }
    
    /// <summary>
    /// 会话主题重命名模型
    /// </summary>
    public string? RenameModel { get; set; }
}