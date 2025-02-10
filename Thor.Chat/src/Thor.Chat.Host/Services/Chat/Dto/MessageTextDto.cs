using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Services.Chat.Dto;

public class MessageTextDto : EntityDto<long>
{
    public long MessageId { get; set; }

    public string Text { get; set; } = null!;
}