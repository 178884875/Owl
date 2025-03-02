namespace Owl.Chat.Core.Entities;

public interface ICreation
{
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// 创建人
    /// </summary>
    public string? CreatedBy { get; set; }
}