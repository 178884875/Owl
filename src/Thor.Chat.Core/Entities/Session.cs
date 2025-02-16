namespace Thor.Chat.Core.Entities;

/// <summary>
/// 会话
/// </summary>
public sealed class Session : Entity<long>
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
    public required string Avatar { get; set; }

    /// <summary>
    /// 会话标签
    /// </summary>
    public string[] Tags { get; set; } = [];

    /// <summary>
    /// 模型名称
    /// </summary>
    public required string Model { get; set; }

    /// <summary>
    /// 温度参数
    /// </summary>
    public double? Temperature { get; set; }

    /// <summary>
    /// 最大令牌数
    /// </summary>
    public int? MaxTokens { get; set; }

    /// <summary>
    /// Top P 参数
    /// </summary>
    public int? TopP { get; set; }

    /// <summary>
    /// 频率惩罚
    /// </summary>
    public int? FrequencyPenalty { get; set; }

    /// <summary>
    /// 存在惩罚
    /// </summary>
    public int? PresencePenalty { get; set; }

    /// <summary>
    /// 是否收藏
    /// </summary>
    public bool Favorite { get; set; }
    
    /// <summary>
    /// 使用历史消息数量
    /// </summary>
    /// <returns></returns>
    public int HistoryMessagesCount { get; set; }

    /// <summary>
    /// 会话组Id
    /// </summary>
    public string? SessionGroupId { get; set; }

    /// <summary>
    /// 会话组
    /// </summary>
    public SessionGroup? SessionGroup { get; set; }
}