using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Ragume.Data;

public sealed class DocumentsSeed
{
    private readonly DocumentsRepository _repository;

    public DocumentsSeed(DocumentsRepository repository)
    {
        _repository = repository;
    }

    public string ResolveFactsPath(string[] args, string outputDirectory, string factsFileName)
    {
        var candidate = args.FirstOrDefault(arg => !string.IsNullOrWhiteSpace(arg) && !arg.StartsWith("-", StringComparison.Ordinal));
        if (string.IsNullOrWhiteSpace(candidate))
        {
            return Path.Combine(outputDirectory, factsFileName);
        }

        return Path.IsPathRooted(candidate)
            ? candidate
            : Path.GetFullPath(candidate, outputDirectory);
    }

    public async Task<List<string>> LoadFactsAsync(string factsPath)
    {
        var resolvedPath = Path.GetFullPath(factsPath);
        if (!File.Exists(resolvedPath))
        {
            Console.WriteLine($"Fact file not found: {resolvedPath}");
            return new List<string>();
        }

        var lines = await File.ReadAllLinesAsync(resolvedPath);
        return lines
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Select(line => line.Trim())
            .ToList();
    }


    public async Task SeedFactsAsync(IEnumerable<string> facts, RagumeDbContext dbContext)
    {
        foreach (var fact in facts)
        {
            var embedding = await _repository.TryGetEmbeddingAsync(fact, CancellationToken.None);
            await _repository.InsertDocumentAsync(fact, embedding, CancellationToken.None);
        }
    }
}

public sealed class OllamaEmbeddingResponse
{
    [JsonPropertyName("embeddings")]
    public List<List<float>>? Embeddings { get; set; }
}

public sealed class OpenAiEmbeddingResponse
{
    [JsonPropertyName("data")]
    public List<OpenAiEmbeddingItem>? Data { get; set; }
}

public sealed class OpenAiEmbeddingItem
{
    [JsonPropertyName("embedding")]
    public List<float>? Embedding { get; set; }
}
