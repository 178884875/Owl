using Owl.Chat.Host.Dto;

namespace Owl.Chat.Host.Services.ModelChannels.Dto;

/// <summary>
/// 模型频道邀请码
/// </summary>
public class ModelChannelInviteCodeDto : EntityDto<long>
{
    /// <summary>
    /// 频道Id
    /// </summary>
    public long ChannelId { get; set; }

    /// <summary>
    /// 邀请码
    /// </summary>
    public string Code { get; set; } = null!;

    /// <summary>
    /// 过期时间
    /// </summary>
    public DateTime? ExpireTime { get; set; }

    /// <summary>
    /// 是否已使用
    /// </summary>
    public bool IsUsed { get; set; }

    /// <summary>
    /// 使用人数
    /// </summary>
    public int UsedCount { get; set; }

    /// <summary>
    /// 最大使用人数
    /// </summary>
    public int MaxUseCount { get; set; }

    /// <summary>
    /// 邀请人
    /// </summary>
    public string Inviter { get; set; } = null!;

    /// <summary>
    /// 是否启用
    /// </summary>
    /// <returns></returns>
    public bool Enabled { get; set; }
    
}