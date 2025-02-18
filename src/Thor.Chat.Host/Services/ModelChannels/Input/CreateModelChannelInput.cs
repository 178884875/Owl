using Thor.Chat.Host.Services.ModelChannels.Dto;

namespace Thor.Chat.Host.Services.ModelChannels.Input;

public class CreateModelChannelInput
{
    /// <summary>
    /// 模型提供商
    /// </summary>
    public string Provider { get; set; } = null!;

    /// <summary>
    /// 提供商地址
    /// </summary>
    public string Endpoint { get; set; } = null!;

    /// <summary>
    /// ModelIds
    /// </summary>
    public List<string> ModelIds { get; set; } = [];

    /// <summary>
    /// 渠道名称
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// 渠道描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 渠道图标
    /// </summary>
    public string? Avatar { get; set; }

    /// <summary>
    /// 渠道标签
    /// </summary>
    public string[] Tags { get; set; } = Array.Empty<string>();

    /// <summary>
    /// 密钥列表
    /// </summary>
    public List<ModelChannelKeyDto> Keys { get; set; } = [];
}