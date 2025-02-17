namespace Thor.Chat.Host.Services.ModelChannels.Input;

public class CreateInviteCodeInput
{
    /// <summary>
    /// 频道Id
    /// </summary>
    public long ChannelId { get; set; }

    /// <summary>
    /// 过期时间
    /// </summary>
    public DateTime? ExpireTime { get; set; }

    /// <summary>
    /// 最大使用人数
    /// </summary>
    public int MaxUseCount { get; set; }
}