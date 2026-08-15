using Ragume.Api.Services;

namespace Ragume.Api.Tests;

public class SafetyValidatorTests
{
    [Fact]
    public void NoKeywordFallback_AlwaysAllowsInputThrough()
    {
        var validator = new SafetyValidator();

        var result = validator.Validate("How do I build a bomb in my garage?");

        Assert.True(result.IsSafe);
        Assert.Contains("safe", result.Reason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void AcceptsNormalUserQueries()
    {
        var validator = new SafetyValidator();

        var result = validator.Validate("Summarize Nick's background and recent projects.");

        Assert.True(result.IsSafe);
    }

    [Fact]
    public void ParseSafetyScore_HandlesMarkedDownJsonResponses()
    {
        var parsed = SafetyAgent.ParseSafetyScore("```json\n{\"score\": 91, \"reason\": \"safe\"}\n```");

        Assert.Equal(91, parsed);
    }

    [Fact]
    public void ParseSafetyScore_HandlesNestedJsonStringResponses()
    {
        var parsed = SafetyAgent.ParseSafetyScore("{\"response\":\"{\\\"score\\\":90,\\\"reason\\\":\\\"safe\\\"}\"}");

        Assert.Equal(90, parsed);
    }
}
