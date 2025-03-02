using Owl.Chat.Host.Dto;

namespace Owl.Chat.Host.Services.Chat.Dto;

public class MessageModelUsageDto : EntityDto<long>
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