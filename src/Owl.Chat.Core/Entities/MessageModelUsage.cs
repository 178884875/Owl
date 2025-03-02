namespace .Chat.Core.Entities;

/// <summary>
/// 对话消息使用情况
/// </summary>
public sealed class MessageModelUsage : Entity<long>
{
    public long? SessionId { get; set; }

    public long? MessageId { get; set; }
    
    /// <summary>
    /// 请求token
    /// </summary>
    public int PromptTokens { get; set; }
    
    /// <summary>
    /// 完成token
    /// </summary>
    /// <returns></returns>
    public int CompleteTokens { get; set; }
    
    /// <summary>
    /// 响应耗时 (ms)
    /// </summary>
    /// <returns></returns>
    public int ResponseTime { get; set; }
}