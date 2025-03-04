namespace Owl.Chat.Host.Dto;

public class InitModelsDto
{
    public List<InitModelChatModels> Models { get; set; }

    /// <summary>
    /// 模型提供者
    /// </summary>
    public string Provider { get; set; }
}

public class InitModelChatModels
{
    public int? ContextWindowTokens { get; set; }
    public string? Description { get; set; }
    public string? DisplayName { get; set; }

    public bool? Enabled { get; set; }

    public string Id { get; set; }

    public string Type { get; set; }

    public int? MaxOutput { get; set; }

    /// <summary>
    /// 模型Id
    /// </summary>
    public string ModelId { get; set; }

    public InitModelPricing? Pricing { get; set; }
    public string ReleasedAt { get; set; }

    public bool? Vision { get; set; }

    public bool? FunctionCall { get; set; }
}

public class InitModelPricing
{
    public double? Input { get; set; }

    public double? Output { get; set; }

    public double? CachedInput { get; set; }

    public double? CachedAudioInput { get; set; }
    
    public double? Standard { get; set; }
    
    public double? WriteCacheInput { get; set; }
    
    public double? AudioInput { get; set; }
    
    public double? AudioOutput { get; set; }
}