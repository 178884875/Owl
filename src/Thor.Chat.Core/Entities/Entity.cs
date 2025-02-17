namespace Thor.Chat.Core.Entities;

public abstract class Entity<TKey> : ICreation
{
    public TKey Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? CreatedBy { get; set; }
}