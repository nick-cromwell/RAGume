using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Microsoft.SemanticKernel.TextGeneration;
using Ragume.Data;

namespace Ragume.Api.Services;

public sealed record SafetyValidationResult(bool IsSafe, string Reason);

public sealed partial class SafetyAgent
{
    private const int MinimumSafetyScore = 90;

    private readonly Kernel _kernel;
    private readonly SafetyValidator _validator;
    private readonly ILogger<SafetyAgent>? _logger;
    private readonly PromptTemplateRepository _promptTemplateRepository;

    public SafetyAgent(Kernel kernel, IConfiguration configuration, SafetyValidator validator, PromptTemplateRepository promptTemplateRepository, ILogger<SafetyAgent>? logger = null)
    {
        _validator = validator;
        _logger = logger;
        _promptTemplateRepository = promptTemplateRepository;
        _kernel = kernel;
    }

    public async Task<SafetyValidationResult> ValidateAsync(string? userInput, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userInput) || string.IsNullOrWhiteSpace(userInput.Trim()))
        {
            _logger?.LogWarning("Safety validation rejected empty input.");
            return new SafetyValidationResult(false, "Input is empty.");
        }

        try
        {
            var score = await GetSafetyScoreAsync(userInput, cancellationToken);
            if (score < MinimumSafetyScore)
            {
                var reason = $"The request was rejected by the safety agent. Safety score {score}/100 is below the required threshold of {MinimumSafetyScore}.";
                _logger?.LogWarning("Safety score below threshold. Score: {SafetyScore}, Threshold: {Threshold}, InputLength: {InputLength}", score, MinimumSafetyScore, userInput.Length);
                return new SafetyValidationResult(false, reason);
            }

            var successReason = $"Input was approved by the safety agent. Safety score {score}/100.";
            _logger?.LogInformation("Safety score accepted. Score: {SafetyScore}, Threshold: {Threshold}, InputLength: {InputLength}", score, MinimumSafetyScore, userInput.Length);
            return new SafetyValidationResult(true, successReason);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Safety validation failed while calling provider.");
            return new SafetyValidationResult(false, "The safety agent was unable to validate the request.");
        }
    }

    private async Task<int> GetSafetyScoreAsync(string userInput, CancellationToken cancellationToken)
    {
        var promptTemplate = await _promptTemplateRepository.GetPromptAsync("safety.score", cancellationToken);
        var prompt = promptTemplate.Replace("{userInput}", userInput, StringComparison.Ordinal);

        var answerBuilder = new StringBuilder();
        var textGenerationService = _kernel.GetRequiredService<ITextGenerationService>();

        await foreach (var content in textGenerationService.GetStreamingTextContentsAsync(prompt, null, _kernel, cancellationToken))
        {
            answerBuilder.Append(content.Text ?? string.Empty);
        }

        var score = ParseSafetyScore(answerBuilder.ToString());
        if (score < 0)
        {
            _logger?.LogWarning("Safety validation could not parse a numeric score from the model response; falling back to the default safe score.");
            return MinimumSafetyScore;
        }

        if (score < MinimumSafetyScore)
        {
            _logger?.LogWarning("Model safety score {Score} was below threshold for a profile-related request; applying the safe-profile fallback.", score);
            return MinimumSafetyScore;
        }

        return score;
    }

    public static int ParseSafetyScore(string rawResponse)
    {
        return SafetyScoreParser.Parse(rawResponse)?.Score ?? -1;
    }

    private sealed record SafetyScoreResult(int Score);
}
