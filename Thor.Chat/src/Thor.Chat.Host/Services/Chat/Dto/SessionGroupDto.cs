using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Services.Chat.Dto;

public class SessionGroupDto : EntityDto<long>
{
    public string Name { get; set; } = null!;

    public string? Description { get; set; }
}