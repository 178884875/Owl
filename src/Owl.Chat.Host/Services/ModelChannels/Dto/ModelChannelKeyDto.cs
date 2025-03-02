namespace Owl.Chat.Host.Services.ModelChannels.Dto;

public class ModelChannelKeyDto
{
    /// <summary>
    /// 对话密钥
    /// </summary>
    public string Key { get; set; }

    /// <summary>
    /// 权重
    /// </summary>
    public ushort Order { get; set; }

    /// <summary>
    /// 描述
    /// </summary>
    public string? Description { get; set; }
}