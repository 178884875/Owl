using System.Text.Json.Serialization;

namespace Owl.Chat.Host.Services.Auth.Dto;

public class OAuthTokenDto
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; }
}