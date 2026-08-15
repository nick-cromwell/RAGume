using System.Text.Json;

namespace Ragume.Api.Services;

public sealed partial class SafetyAgent
{
    private sealed class SafetyScoreParser
    {
        public static SafetyScoreResult? Parse(string rawResponse)
        {
            if (string.IsNullOrWhiteSpace(rawResponse))
            {
                return null;
            }

            var normalized = Normalize(rawResponse);

            if (TryParseJson(normalized, out var score))
            {
                return new SafetyScoreResult(score);
            }

            return TryParseText(normalized);
        }

        private static string Normalize(string rawResponse)
        {
            var value = rawResponse.Trim();
            var fenceStart = value.IndexOf("```", StringComparison.Ordinal);
            if (fenceStart >= 0)
            {
                var fenceEnd = value.LastIndexOf("```", StringComparison.Ordinal);
                if (fenceEnd > fenceStart)
                {
                    value = value.Substring(fenceStart + 3, fenceEnd - (fenceStart + 3)).Trim();
                }
            }

            return value
                .Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("```", string.Empty, StringComparison.Ordinal)
                .Trim();
        }

        private static bool TryParseJson(string rawJson, out int score)
        {
            score = 0;

            try
            {
                using var document = JsonDocument.Parse(rawJson);
                return TryReadScore(document.RootElement, out score);
            }
            catch (JsonException)
            {
                return false;
            }
        }

        private static bool TryReadScore(JsonElement element, out int score)
        {
            score = 0;

            if (element.ValueKind == JsonValueKind.Object)
            {
                foreach (var property in element.EnumerateObject())
                {
                    if (property.NameEquals("score"))
                    {
                        return TryConvertScore(property.Value, out score);
                    }

                    if (property.NameEquals("response") && TryReadScore(property.Value, out score))
                    {
                        return true;
                    }
                }
            }

            if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var child in element.EnumerateArray())
                {
                    if (TryReadScore(child, out score))
                    {
                        return true;
                    }
                }
            }

            if (element.ValueKind == JsonValueKind.String)
            {
                var text = element.GetString();
                if (string.IsNullOrWhiteSpace(text))
                {
                    return false;
                }

                var innerCandidate = text.Trim();
                if (TryParseJson(innerCandidate, out score))
                {
                    return true;
                }

                if (TryParseText(innerCandidate) is { } parsedText)
                {
                    score = parsedText.Score;
                    return true;
                }
            }

            return false;
        }

        private static bool TryConvertScore(JsonElement value, out int score)
        {
            score = 0;

            if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out score))
            {
                return true;
            }

            if (value.ValueKind == JsonValueKind.String && int.TryParse(value.GetString(), out score))
            {
                return true;
            }

            return false;
        }

        private static SafetyScoreResult? TryParseText(string text)
        {
            var markers = new[] { "score", "safety score" };

            foreach (var marker in markers)
            {
                var index = text.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
                if (index < 0)
                {
                    continue;
                }

                var remainder = text.Substring(index + marker.Length);
                foreach (var ch in remainder)
                {
                    if (char.IsDigit(ch))
                    {
                        var valueStart = remainder.IndexOf(ch, StringComparison.Ordinal);
                        var digits = new string(remainder.Skip(valueStart).TakeWhile(char.IsDigit).ToArray());
                        if (int.TryParse(digits, out var parsedScore))
                        {
                            return new SafetyScoreResult(parsedScore);
                        }
                    }
                }
            }

            return null;
        }
    }
}
