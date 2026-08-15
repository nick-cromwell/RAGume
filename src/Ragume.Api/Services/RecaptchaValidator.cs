using System.Text.Json.Serialization;

namespace Ragume.Api.Services;

public sealed class RecaptchaValidator
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RecaptchaValidator> _logger;

    public RecaptchaValidator(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<RecaptchaValidator> logger)
    {
        _httpClient = httpClientFactory.CreateClient(nameof(RecaptchaValidator));
        _configuration = configuration;
        _logger = logger;
    }

    public bool IsEnabled()
    {
        return _configuration.GetValue<bool>("Recaptcha:Enabled")
            && !string.IsNullOrWhiteSpace(_configuration["Recaptcha:SecretKey"]);
    }

    public async Task<bool> ValidateAsync(string? token, string action, CancellationToken cancellationToken = default)
    {
        var enabled = IsEnabled();
        _logger.LogInformation("Recaptcha validation started for action '{Action}'. Enabled: {Enabled}. Token present: {HasToken}.", action, enabled, !string.IsNullOrWhiteSpace(token));

        if (!enabled)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("Recaptcha validation failed because no token was supplied for action '{Action}'.", action);
            return false;
        }

        var verificationUrl = _configuration["Recaptcha:VerificationUrl"] ?? "https://www.google.com/recaptcha/api/siteverify";
        var secretKey = _configuration["Recaptcha:SecretKey"];
        var minimumScore = _configuration.GetValue<double>("Recaptcha:MinimumScore", 0.5);

        using var form = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("secret", secretKey!),
            new KeyValuePair<string, string>("response", token)
        });

        _logger.LogInformation("Sending recaptcha verification request to {VerificationUrl} for action '{Action}'.", verificationUrl, action);
        using var response = await _httpClient.PostAsync(verificationUrl, form, cancellationToken);
        _logger.LogInformation("Recaptcha verification response for action '{Action}' returned status {StatusCode}.", action, response.StatusCode);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Recaptcha verification request failed with status code {StatusCode} for action '{Action}'.", response.StatusCode, action);
            return false;
        }

        var payload = await response.Content.ReadFromJsonAsync<RecaptchaVerificationResponse>(cancellationToken: cancellationToken);
        if (payload is null)
        {
            _logger.LogWarning("Recaptcha verification response was empty for action '{Action}'.", action);
            return false;
        }

        if (!payload.Success)
        {
            _logger.LogWarning("Recaptcha verification failed for action '{Action}'. Errors: {ErrorCodes}", action, payload.ErrorCodes);
            return false;
        }

        if (payload.Score.HasValue && payload.Score.Value < minimumScore)
        {
            _logger.LogWarning("Recaptcha score {Score} was below the minimum threshold {MinimumScore} for action '{Action}'.", payload.Score.Value, minimumScore, action);
            return false;
        }

        if (!string.IsNullOrWhiteSpace(payload.Action) && !string.Equals(payload.Action, action, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Recaptcha action mismatch: expected '{ExpectedAction}' but got '{ActualAction}'.", action, payload.Action);
            return false;
        }

        return true;
    }

    private sealed class RecaptchaVerificationResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("score")]
        public double? Score { get; set; }

        [JsonPropertyName("action")]
        public string? Action { get; set; }

        [JsonPropertyName("error-codes")]
        public string[]? ErrorCodes { get; set; }
    }
}
