using Owl.Chat.Host.Dto;

namespace Owl.Chat.Host.Services.Chat.Dto;

public class MessageTextDto : EntityDto<long>
{
    public long MessageId { get; set; }
    
    /// <summary>
    /// 推理更新
    /// </summary>
    public string? ReasoningUpdate { get; set; } 
    
    /// <summary>
    /// 搜索结果
    /// </summary>
    public List<SearchResultDto> SearchResults { get; set; } = new();

    /// <summary>
    /// 扩展数据
    /// </summary>
    public Dictionary<string, string> ExtraData { get; set; } = new();

    public string Text { get; set; } = null!;
}