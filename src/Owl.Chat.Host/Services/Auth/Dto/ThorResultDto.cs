using System.Text.Json.Serialization;

namespace Owl.Chat.Host.Services.Auth.Dto;

public class ThorResultDto<T>
{
    [JsonPropertyName("message")]
    public string? Message { get; set; }
    
    [JsonPropertyName("success")]
    public bool Success { get; set; }
    
    [JsonPropertyName("data")]
    public T Data { get; set; }
}

public class ThorUserDataDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; }
    
    [JsonPropertyName("userName")]
    public string UserName { get; set; }
    
    [JsonPropertyName("email")]
    public string Email { get; set; }
    
    [JsonPropertyName("role")]
    public string Role { get; set; }
    
}

