namespace Owl.Chat.Host.Services.Chat.Input;

public class CreateSessionInput
{
    /// <summary>
    /// 会话名称
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// 会话描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 会话图标
    /// </summary>
    public  string? Avatar { get; set; }
    
    /// <summary>
    /// 会话组Id
    /// </summary>
    public string? SessionGroupId { get; set; }
    
    /// <summary>
    /// 选择的模型Id
    /// </summary>
    public string ModelId { get; set; } = null!;
}