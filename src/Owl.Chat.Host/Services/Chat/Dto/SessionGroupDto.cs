using Owl.Chat.Host.Dto;

namespace Owl.Chat.Host.Services.Chat.Dto;

public class SessionGroupDto : EntityDto<long>
{
    public string Name { get; set; } = null!;

    public string? Description { get; set; }
}