namespace .Chat.Core.Entities;

public class Model : Entity<string>
{
    /// <summary>
    /// 服务提供商
    /// </summary>
    /// <returns></returns>
    public string Provider { get; set; }

    /// <summary>
    /// 模型Id
    /// </summary>
    public string ModelId { get; set; }

    /// <summary>
    /// 模型的显示名称
    /// </summary>
    public string DisplayName { get; set; }

    /// <summary>
    /// 模型的描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 模型的类型
    /// </summary>
    public string Type { get; set; } = "chat";

    /// <summary>
    /// 模型的上下文窗口令牌数
    /// </summary>
    public int? ContextWindowTokens { get; set; }

    /// <summary>
    /// 模型的最大输出
    /// </summary>
    public int? MaxOutput { get; set; }

    /// <summary>
    /// 模型的定价信息
    /// </summary>
    public Pricing Pricing { get; set; } = new Pricing();

    /// <summary>
    /// 模型的发布日期
    /// </summary>
    public string? ReleasedAt { get; set; }

    /// <summary>
    /// 模型的功能
    /// </summary>
    public Abilities Abilities { get; set; } = new Abilities();

    /// <summary>
    /// 模型的分辨率
    /// </summary>
    public string[] Resolutions { get; set; } = [];

    /// <summary>
    /// 模型是否启用
    /// </summary>
    public bool? Enabled { get; set; }
}

public class Pricing
{
    /// <summary>
    /// 输入的价格
    /// </summary>
    public double? Input { get; set; }

    /// <summary>
    /// 输出的价格
    /// </summary>
    public double? Output { get; set; }

    /// <summary>
    /// 写缓存输入的价格
    /// </summary>
    public double? WriteCacheInput { get; set; }

    /// <summary>
    /// 音频输入的价格
    /// </summary>
    public double? AudioInput { get; set; }

    /// <summary>
    /// 音频输出的价格
    /// </summary>
    public double? AudioOutput { get; set; }

    /// <summary>
    /// 缓存音频输入的价格
    /// </summary>
    public double? CachedAudioInput { get; set; }

    /// <summary>
    /// 缓存输入的价格
    /// </summary>
    public double? CachedInput { get; set; }

    /// <summary>
    /// 货币类型
    /// </summary>
    public string Currency { get; set; }

    /// <summary>
    /// 高清价格
    /// </summary>
    public double? Hd { get; set; }

    /// <summary>
    /// 标准价格
    /// </summary>
    public double? Standard { get; set; }
}

public class Abilities
{
    /// <summary>
    /// 是否支持函数调用
    /// </summary>
    public bool? FunctionCall { get; set; }

    /// <summary>
    /// 是否支持推理
    /// </summary>
    public bool? Reasoning { get; set; }

    /// <summary>
    /// 是否支持视觉
    /// </summary>
    public bool? Vision { get; set; }
}