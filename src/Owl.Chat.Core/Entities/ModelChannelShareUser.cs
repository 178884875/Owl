namespace Owl.Chat.Core.Entities;

/// <summary>
/// 模型渠道分享可用用户
/// </summary>
public sealed class ModelChannelShareUser : Entity<long>
{
    public long ChannelId { get; set; }

    public string UserId { get; set; } = null!;
    
    /// <summary>
    /// 可用额度
    /// </summary>
    public int Quota { get; set; }
    
    /// <summary>
    /// 是否启用
    /// </summary>
    public bool Enabled { get; set; }
    
    /// <summary>
    /// token消耗数量
    /// </summary>
    /// <returns></returns>
    public long TokenCount { get; set; }
    
    /// <summary>
    /// 请求数量
    /// </summary>
    public long? RequestCount { get; set; }
    
    /// <summary>
    /// 最后使用时间
    /// </summary>
    public DateTime LastUsedAt { get; set; }

    /// <summary>
    /// 模型渠道
    /// </summary>
    public ModelChannel Channel { get; set; } = null!;

    /// <summary>
    /// 用户
    /// </summary>
    public User User { get; set; } = null!;
}