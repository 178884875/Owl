using System.Text.Json.Serialization;

namespace Owl.Chat.Host.Services.Chat.Dto;

public class OpenAIModel
{
    public Data[] Data { get; set; }
}

public class Data
{
    [JsonPropertyName("id")]
    public string Id { get; set; }
    
    [JsonPropertyName("object")]
    public string Object { get; set; }
    
    [JsonPropertyName("created")]
    public int Created { get; set; }
    
    [JsonPropertyName("owned_by")]
    public string OwnedBy { get; set; }
}

