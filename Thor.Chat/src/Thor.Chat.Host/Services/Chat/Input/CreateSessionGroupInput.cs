namespace Thor.Chat.Host.Services.Chat.Input;

public class CreateSessionGroupInput
{
    public string Name { get; set; } = null!;
    
    public string? Description { get; set; }
}