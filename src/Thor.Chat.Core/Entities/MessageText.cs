namespace Thor.Chat.Core.Entities;

/// <summary>
/// 对话消息文本
/// </summary>
public sealed class MessageText : Entity<long>
{
    /// <summary>
    /// 消息Id
    /// </summary>
    public long MessageId { get; set; }

    /// <summary>
    /// 推理更新
    /// </summary>
    public string? ReasoningUpdate { get; set; }

    /// <summary>
    /// 文本
    /// </summary>
    public string Text { get; set; } = null!;

    public List<SearchResult> SearchResults { get; set; } = new();

    /// <summary>
    /// 扩展数据
    /// </summary>
    public Dictionary<string, string> ExtraData { get; set; } = new();

    public Message Message { get; set; } = null!;
}

public class SearchResult
{
    public string Title { get; set; } // 搜索结果标题

    public string Url { get; set; } // 搜索结果 URL

    public string Snippet { get; set; } // 搜索结果摘要
}