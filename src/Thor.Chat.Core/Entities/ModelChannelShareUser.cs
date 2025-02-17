namespace Thor.Chat.Core.Entities;

/// <summary>
/// 模型渠道分享可用用户
/// </summary>
public sealed class ModelChannelShareUser : Entity<long>
{
    public string ChannelId { get; set; } = null!;

    public string UserId { get; set; } = null!;
    
    /// <summary>
    /// 是否启用 这个由用户自己控制
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// 模型渠道
    /// </summary>
    public ModelChannel Channel { get; set; } = null!;

    /// <summary>
    /// 用户
    /// </summary>
    public User User { get; set; } = null!;
}