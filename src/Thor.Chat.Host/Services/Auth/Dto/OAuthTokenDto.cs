using System.Text.Json.Serialization;

namespace Thor.Chat.Host.Services.Auth.Dto;

public class OAuthTokenDto
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; }
}