using System.Collections.Concurrent;
using Microsoft.SemanticKernel;

namespace Thor.Chat.Host.AI;

public class KernelFactory
{
    private static readonly ConcurrentDictionary<string, Lazy<Kernel>> Kernels = new();

    public static Kernel CreateKernel(string model, string endpoint, string? apiKey, string provider)
    {
        var key = model + endpoint + apiKey + provider;

        return Kernels.GetOrAdd(key, ValueFactory).Value;

        Lazy<Kernel> ValueFactory(string key)
        {
            return new Lazy<Kernel>(() =>
            {
                var kernelBuilder = Kernel.CreateBuilder();

                switch (provider.ToLower())
                {
                    case "openai":
                        kernelBuilder.AddOpenAIChatCompletion(model, new Uri(endpoint), apiKey, "Thor-Chat");
                        break;
                    case "ollama":
                        kernelBuilder.AddOllamaChatCompletion(model, new Uri(endpoint));
                        break;
                }

                return kernelBuilder.Build();
            });
        }
    }
}