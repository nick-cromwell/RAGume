namespace Ragume.Api.Services;

public sealed class SafetyValidator
{
    public SafetyValidationResult Validate(string? userInput)
    {
        var input = userInput?.Trim();
        if (string.IsNullOrWhiteSpace(input))
        {
            return new SafetyValidationResult(false, "The input is empty.");
        }

        return new SafetyValidationResult(true, "Input appears safe for processing.");
    }
}
