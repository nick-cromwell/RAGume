using System.Runtime.CompilerServices;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.TextGeneration;
using Ragume.Data;

namespace Ragume.Api.Services;

public sealed record RagResult(string Answer);

public sealed class RagService
{
    private readonly Kernel _kernel;
    private readonly DocumentsRepository _documentsRepository;
    private readonly PromptTemplateRepository _promptTemplateRepository;
    private readonly ILogger<RagService> _logger;

    public RagService(Kernel kernel, DocumentsRepository documentsRepository, PromptTemplateRepository promptTemplateRepository, ILogger<RagService>? logger)
    {
        _kernel = kernel;
        _documentsRepository = documentsRepository;
        _promptTemplateRepository = promptTemplateRepository;
        _logger = logger ?? NullLogger<RagService>.Instance;
    }

    public async Task<RagResult> QueryAsync(string userInput, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("RagService received query: {UserInput}", userInput);

        var context = await _documentsRepository.SearchRelevantContextAsync(userInput, cancellationToken);
        var answer = await GenerateAnswerAsync(userInput, context, cancellationToken);

        return new RagResult(answer);
    }

    public async IAsyncEnumerable<string> QueryStreamAsync(string userInput, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("RagService received query: {UserInput}", userInput);

        var context = await _documentsRepository.SearchRelevantContextAsync(userInput, cancellationToken);

        if (context.Count == 0)
        {
            yield return "I do not have enough relevant context to answer this yet.";
            yield break;
        }

        var promptTemplate = await _promptTemplateRepository.GetPromptAsync("rag.answer", cancellationToken);
        var prompt = promptTemplate
            .Replace("{context}", string.Join("\n---\n", context), StringComparison.Ordinal)
            .Replace("{userInput}", userInput, StringComparison.Ordinal);

        _logger.LogInformation("RagService prompt for answer generation: {Prompt}", prompt);

        await foreach (var chunk in StreamAnswerAsync(prompt, cancellationToken))
        {
            yield return chunk;
        }
    }

    private async Task<string> GenerateAnswerAsync(string userInput, IList<string> context, CancellationToken cancellationToken)
    {
        if (context.Count == 0)
        {
            return "I do not have enough relevant context to answer this yet.";
        }

        var promptTemplate = await _promptTemplateRepository.GetPromptAsync("rag.answer", cancellationToken);
        var prompt = promptTemplate
            .Replace("{context}", string.Join("\n---\n", context), StringComparison.Ordinal)
            .Replace("{userInput}", userInput, StringComparison.Ordinal);

        var answerBuilder = new StringBuilder();
        await foreach (var chunk in StreamAnswerAsync(prompt, cancellationToken))
        {
            answerBuilder.Append(chunk);
        }

        return answerBuilder.ToString();
    }

    private async IAsyncEnumerable<string> StreamAnswerAsync(string prompt, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var textGenerationService = _kernel.GetRequiredService<ITextGenerationService>();

        await foreach (var content in textGenerationService.GetStreamingTextContentsAsync(prompt, null, _kernel, cancellationToken))
        {
            var chunk = content.Text ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(chunk))
            {
                yield return chunk;
            }
        }
    }
}
