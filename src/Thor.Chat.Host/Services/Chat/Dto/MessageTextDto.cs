using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Services.Chat.Dto;

public class MessageTextDto : EntityDto<long>
{
    public long MessageId { get; set; }
    
    /// <summary>
    /// 推理更新
    /// </summary>
    public string? ReasoningUpdate { get; set; } 

    public string Text { get; set; } = null!;
}