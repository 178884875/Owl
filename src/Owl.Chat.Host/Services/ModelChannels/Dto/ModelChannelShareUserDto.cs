using Owl.Chat.Host.Dto;

namespace Owl.Chat.Host.Services.ModelChannels.Dto;

public class ModelChannelShareUserDto : EntityDto<long>
{
    public long ChannelId { get; set; }

    public string UserId { get; set; } = null!;

    /// <summary>
    /// 是否启用 这个由用户自己控制
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
    public long RequestCount { get; set; }

    /// <summary>
    /// 模型渠道
    /// </summary>
    public ModelChannelDto Channel { get; set; } = null!;

    /// <summary>
    /// 用户
    /// </summary>
    public UserDto User { get; set; } = null!;
}