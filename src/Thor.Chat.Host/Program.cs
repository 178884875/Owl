using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using Thor.Chat.Host.Converters;
using Thor.Chat.Host.Extensions;
using Thor.Chat.Host.Service;

namespace Thor.Chat.Host;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddServices(builder.Configuration);

        builder.Services.AddHttpClient();
        builder.Services.AddHttpClient("Authorize")
            .ConfigureHttpClient(((provider, client) =>
            {
                client.DefaultRequestHeaders.Add("Accept", "application/json");
                client.DefaultRequestHeaders.Add("User-Agent", "ThorChat");
            }));

        builder.Services.ConfigureHttpJsonOptions((options =>
        {
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.SerializerOptions.Converters.Add(new JsonDateTimeConverter());
            options.SerializerOptions.Converters.Add(new JsonDateTimeOffsetConverter());
        }));

        builder.Services.AddHostedService<InitModelBackstageService>();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapMiniApis();

        await app.RunAsync();
    }
}