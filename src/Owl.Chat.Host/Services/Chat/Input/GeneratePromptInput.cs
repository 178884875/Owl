namespace Owl.Chat.Host.Services.Chat.Input;

public class GeneratePromptInput
{
    /// <summary>
    /// 需要优化的提示词
    /// </summary>
    public string Prompt { get; set; }
    
    /// <summary>
    /// 会话Id
    /// </summary>
    public long SessionId { get; set; }
}