using Thor.Chat.Core.Entities;

namespace Thor.Chat.Host.Dto;

public abstract class EntityDto<TKey> : ICreation
{
    public TKey Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? CreatedBy { get; set; }
}