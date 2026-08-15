using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.AI;

namespace Ragume.KernelFactory;

public sealed class OpenAiEmbeddingService : IEmbeddingGenerator<string, Embedding<float>>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public OpenAiEmbeddingService(HttpClient httpClient, string apiKey, string model)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _apiKey = string.IsNullOrWhiteSpace(apiKey)
            ? throw new ArgumentException("OpenAI API key is required.", nameof(apiKey))
            : apiKey;
        _model = string.IsNullOrWhiteSpace(model)
            ? throw new ArgumentException("OpenAI embedding model name is required.", nameof(model))
            : model;

        _httpClient.BaseAddress ??= new Uri("https://api.openai.com/");
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public void Dispose()
    { }

    public async Task<Embedding<float>> GenerateAsync(string value, EmbeddingGenerationOptions? options = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Embedding input cannot be empty.", nameof(value));
        }

        var generated = await GenerateAsync(new[] { value }, options, cancellationToken);
        return generated[0];
    }

    public async Task<GeneratedEmbeddings<Embedding<float>>> GenerateAsync(IEnumerable<string> values, EmbeddingGenerationOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(values);

        var inputValues = values as string[] ?? values.ToArray();
        if (inputValues.Length == 0)
        {
            return new GeneratedEmbeddings<Embedding<float>>();
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/embeddings");
        var requestedDimensions = options?.Dimensions;

        request.Content = JsonContent.Create(new OpenAiEmbeddingRequest
        {
            Input = inputValues.Length == 1 ? inputValues[0] : inputValues,
            Model = _model,
            Dimensions = requestedDimensions is > 0 ? requestedDimensions.Value : null
        });

        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"OpenAI embedding request failed with status {(int)response.StatusCode}: {payload}");
        }

        var embeddingResponse = JsonSerializer.Deserialize<OpenAiEmbeddingResponse>(payload, JsonOptions)
            ?? throw new InvalidOperationException("OpenAI embedding response was empty.");

        if (embeddingResponse.Data.Count == 0)
        {
            throw new InvalidOperationException("OpenAI embedding response did not contain embedding values.");
        }

        var embeddings = embeddingResponse.Data
            .Select(item => item.Embedding.Count == 0
                ? throw new InvalidOperationException("OpenAI embedding response contained an empty embedding.")
                : new Embedding<float>(item.Embedding.ToArray()))
            .ToArray();

        return new GeneratedEmbeddings<Embedding<float>>(embeddings);
    }

    public object? GetService(Type serviceType, object? serviceKey = null)
    {
        ArgumentNullException.ThrowIfNull(serviceType);

        if (serviceType == typeof(IEmbeddingGenerator) ||
            serviceType == typeof(IEmbeddingGenerator<string, Embedding<float>>) ||
            serviceType == GetType())
        {
            return this;
        }

        if (serviceType == typeof(EmbeddingGeneratorMetadata))
        {
            return new EmbeddingGeneratorMetadata("OpenAI", new Uri("https://platform.openai.com"), _model);
        }

        return null;
    }

    private sealed class OpenAiEmbeddingRequest
    {
        [JsonPropertyName("input")]
        public object Input { get; set; } = string.Empty;

        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("dimensions")]
        public int? Dimensions { get; set; }
    }

    private sealed class OpenAiEmbeddingResponse
    {
        [JsonPropertyName("data")]
        public List<OpenAiEmbeddingItem> Data { get; set; } = new();
    }

    private sealed class OpenAiEmbeddingItem
    {
        [JsonPropertyName("embedding")]
        public List<float> Embedding { get; set; } = new();
    }
}
