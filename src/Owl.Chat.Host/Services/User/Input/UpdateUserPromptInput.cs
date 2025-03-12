namespace Owl.Chat.Host.Services.User.Input;

public class UpdateUserPromptInput
{
    public long Id { get; set; }
    
    /// <summary>
    /// 名称
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// 描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 提示词
    /// </summary>
    public string? Prompt { get; set; }
}