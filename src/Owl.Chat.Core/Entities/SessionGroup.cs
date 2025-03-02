namespace Owl.Chat.Core.Entities;

/// <summary>
/// 消息会话组
/// </summary>
public sealed class SessionGroup : Entity<string>
{
    public string Name { get; set; } = null!;
    
    public string? Description { get; set; }
}