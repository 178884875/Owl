using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Services.ModelChannels.Dto;

public class ModelChannelShareUserDto : EntityDto<long>
{
    public long ChannelId { get; set; }

    public string UserId { get; set; } = null!;

    /// <summary>
    /// 是否启用 这个由用户自己控制
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// 模型渠道
    /// </summary>
    public ModelChannelDto Channel { get; set; } = null!;

    /// <summary>
    /// 用户
    /// </summary>
    public UserDto User { get; set; } = null!;
}