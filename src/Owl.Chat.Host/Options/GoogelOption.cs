namespace Owl.Chat.Host.Options;

public class GoogelOption
{
    public const string Name = "Googel";
    
    public bool Enabled { get; set; }
    
    /// <summary>
    /// GoogleClientId
    /// </summary>
    public string? ClientId { get; set; }
    
    /// <summary>
    /// GoogleClientSecret
    /// </summary>
    public string? ClientSecret { get; set; }
}