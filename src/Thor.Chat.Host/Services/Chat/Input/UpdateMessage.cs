using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Services.Chat.Input;

public class UpdateMessage
{
    public List<MessageTextInput> Texts { get; set; } = new();
}

public class MessageTextInput : EntityDto<long>
{
    public string Text { get; set; } = null!;
}
