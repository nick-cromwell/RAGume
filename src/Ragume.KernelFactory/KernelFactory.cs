using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;

namespace Ragume.KernelFactory;

public static class KernelFactory
{
    public const string OpenAIProviderName = "openai";
    public const string OllamaProviderName = "ollama";

    public static Kernel Create(IConfiguration configuration)
    {
        var aiProvider = ResolveChatProvider(configuration);
        var embeddingsProvider = ResolveEmbeddingProvider(configuration);

        var builder = Kernel.CreateBuilder();
        ConfigureAiProvider(configuration, aiProvider, builder);
        ConfigureEmbeddingsProvider(configuration, embeddingsProvider, builder);

        return builder.Build();
    }

    public static string ResolveChatProvider(IConfiguration configuration)
        => (configuration["AI:Provider"] ?? configuration["Provider"] ?? OllamaProviderName).Trim();

    public static string ResolveEmbeddingProvider(IConfiguration configuration)
        => (configuration["Embeddings:Provider"] ?? configuration["AI:Provider"] ?? configuration["Provider"] ?? OllamaProviderName).Trim();

    public static int ResolveEmbeddingDimensions(IConfiguration configuration, int defaultDimensions = 768)
    {
        if (int.TryParse(configuration["Embeddings:Dimension"], out var configuredDimensions) && configuredDimensions > 0)
        {
            return configuredDimensions;
        }

        return defaultDimensions;
    }

    private static string ResolveOpenAiApiKey(IConfiguration configuration)
        => configuration["AI:OpenAI:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? string.Empty;

    private static string ResolveOllamaBaseUrl(IConfiguration configuration)
        => configuration["AI:Ollama:BaseUrl"] ?? "http://localhost:11434";

    private static void ConfigureAiProvider(IConfiguration configuration, string? aiProvider, IKernelBuilder builder)
    {
        if (string.Equals(aiProvider, OpenAIProviderName, StringComparison.OrdinalIgnoreCase))
        {
            var apiKey = ResolveOpenAiApiKey(configuration);
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("OpenAI API key is required. Set AI:OpenAI:ApiKey or the OPENAI_API_KEY environment variable.");
            }

            var chatModel = configuration["AI:OpenAI:ChatModel"] ?? "gpt-4.1-nano";
            builder.AddOpenAIChatCompletion(modelId: chatModel, apiKey: apiKey);
            return;
        }

        var ollamaChatModel = configuration["AI:Ollama:ChatModel"] ?? "llama3.2";
        builder.AddOllamaTextGeneration(modelId: ollamaChatModel, endpoint: new Uri(ResolveOllamaBaseUrl(configuration)));
    }

    private static void ConfigureEmbeddingsProvider(IConfiguration configuration, string? embeddingsProvider, IKernelBuilder builder)
    {
        if (string.Equals(embeddingsProvider, OpenAIProviderName, StringComparison.OrdinalIgnoreCase))
        {
            var apiKey = ResolveOpenAiApiKey(configuration);
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("OpenAI API key is required. Set AI:OpenAI:ApiKey or the OPENAI_API_KEY environment variable.");
            }

            var embeddingModel = configuration["Embeddings:OpenAI:EmbeddingModel"] ?? configuration["Embeddings:Model"] ?? "text-embedding-3-small";

            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("https://api.openai.com/")
            };

            builder.Services.AddEmbeddingGenerator(new OpenAiEmbeddingService(httpClient, apiKey, embeddingModel));
            return;
        }

        var ollamaEmbeddingModel = configuration["Embeddings:Ollama:EmbeddingModel"] ?? configuration["Embeddings:Model"] ?? "nomic-embed-text";
        builder.AddOllamaEmbeddingGenerator(modelId: ollamaEmbeddingModel, endpoint: new Uri(ResolveOllamaBaseUrl(configuration)));
    }
}
