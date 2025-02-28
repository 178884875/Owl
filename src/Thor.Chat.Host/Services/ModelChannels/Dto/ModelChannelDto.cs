using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Services.ModelChannels.Dto;

public class ModelChannelDto : EntityDto<long>
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
    public string[] Tags { get; set; } = [];

    /// <summary>
    /// 是否收藏
    /// </summary>
    public bool Favorite { get; set; }

    /// <summary>
    /// 是否启用
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// 最近响应耗时
    /// </summary>
    public long? ResponseTime { get; set; }
    
    /// <summary>
    /// 是否可用
    /// </summary>
    public bool Available { get; set; }

    /// <summary>
    /// token消耗总量
    /// </summary>
    /// <returns></returns>
    public long? TokenCost { get; set; }

    /// <summary>
    /// 请求数量
    /// </summary>
    public long? RequestCount { get; set; }
    
    /// <summary>
    /// 是否是共享渠道
    /// </summary>
    public bool IsShare { get; set; }

    /// <summary>
    /// 密钥列表
    /// </summary>
    public List<ModelChannelKeyDto> Keys { get; set; } = [];
    
    /// <summary>
    /// 共享用户列表
    /// </summary>
    public List<ModelChannelShareUserDto>? ShareUsers { get; set; }
}