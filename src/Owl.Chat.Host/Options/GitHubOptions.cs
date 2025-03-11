namespace Owl.Chat.Host.Options;

public class GitHubOptions
{
    public const string Name = "GitHub";
    
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