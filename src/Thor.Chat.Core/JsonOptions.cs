using System.Text.Json;
using System.Text.Json.Serialization;

namespace Thor.Chat.Core;

public class JsonOptions
{
    public static JsonSerializerOptions DefaultJsonSerializerOptions { get; } = new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        // 忽略空值
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
        PropertyNameCaseInsensitive = true,
        Converters =
        {
            new JsonStringEnumConverter()
        }
    };
}