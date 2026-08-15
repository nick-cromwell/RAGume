using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Ragume.KernelFactory;

namespace Ragume.Data;

public sealed class DocumentsRepository
{
    private readonly IConfiguration _configuration;
    private readonly Kernel _kernel;
    private readonly RagumeDbContext _dbContext;
    private readonly ILogger<DocumentsRepository>? _logger;

    public DocumentsRepository(IConfiguration configuration, Kernel kernel, RagumeDbContext dbContext, ILogger<DocumentsRepository>? logger = null)
    {
        _configuration = configuration;
        _kernel = kernel;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<float[]> TryGetEmbeddingAsync(string text, CancellationToken cancellationToken)
    {
        var embeddingGenerator = _kernel.GetRequiredService<IEmbeddingGenerator<string, Embedding<float>>>();
        var provider = (_configuration["Embeddings:Provider"] ?? "ollama").Trim();
        var configuredDimensions = KernelFactory.KernelFactory.ResolveEmbeddingDimensions(_configuration);

        var options = string.Equals(provider, "openai", StringComparison.OrdinalIgnoreCase)
            ? new EmbeddingGenerationOptions { Dimensions = configuredDimensions }
            : null;

        var embedding = await embeddingGenerator.GenerateAsync(text, options, cancellationToken);

        if (embedding is null || embedding.Vector.Length == 0)
        {
            throw new InvalidOperationException("No embedding values were returned from the configured embedding provider.");
        }

        var embeddingValues = embedding.Vector.ToArray();
        _logger?.LogInformation("Generated embedding vector.");

        return embeddingValues;
    }

    public async Task<List<string>> SearchRelevantContextAsync(string userInput, CancellationToken cancellationToken)
    {
        var embedding = await TryGetEmbeddingAsync(userInput, cancellationToken);
        var vectorLiteral = ToVectorLiteral(embedding);

        var sql = $"SELECT * FROM \"documents\" ORDER BY \"Embedding\" <=> '{vectorLiteral}'::vector LIMIT 15";

        return await _dbContext.Documents
            .FromSqlRaw(sql)
            .AsNoTracking()
            .Select(document => document.Content)
            .ToListAsync(cancellationToken);
    }

    public async Task InsertDocumentAsync(string content, float[] embedding, CancellationToken cancellationToken = default)
    {
        var vectorLiteral = ToVectorLiteral(embedding);
        var escapedContent = content.Replace("'", "''");

        var sql = string.Format(
            "INSERT INTO \"documents\" (\"Content\", \"Embedding\", \"Metadata\") VALUES ('{0}', '{1}'::vector, NULL);",
            escapedContent,
            vectorLiteral);

        await _dbContext.Database.ExecuteSqlRawAsync(sql, cancellationToken);
    }

    private static string ToVectorLiteral(float[] embedding)
    {
        if (embedding.Length == 0)
        {
            return "[]";
        }

        return $"[{string.Join(",", embedding.Select(value => value.ToString("G", CultureInfo.InvariantCulture)))}]";
    }
}
