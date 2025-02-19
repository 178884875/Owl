namespace Thor.Chat.Host.Services.FileStorage.Dto;

public class UploadDto
{
    public string FileName { get; set; } = null!;
    
    public string Path { get; set; } = null!;
    
    public string Id { get; set; } = null!;
}