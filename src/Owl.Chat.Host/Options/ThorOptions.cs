namespace Owl.Chat.Host.Options;

public class ThorOptions
{
    public const string Name = "Thor";
    
    public bool Enabled { get; set; }
    
    /// <summary>
    /// Thor 地址
    /// https://thor.xxx.com
    /// </summary>
    public string? Host { get; set; }
}