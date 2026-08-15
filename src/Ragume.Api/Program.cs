using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Ragume.Api;
using Ragume.Api.Services;
using Ragume.Data;
using Ragume.KernelFactory;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")}.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors();
builder.Services.AddHttpClient(nameof(RecaptchaValidator), client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services.AddSingleton<SafetyValidator>();
builder.Services.AddScoped<RecaptchaValidator>();
builder.Services.AddScoped<DocumentsRepository>();
builder.Services.AddScoped<PromptTemplateRepository>();
builder.Services.AddDbContext<RagumeDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default") ?? "Host=localhost;Port=5432;Database=ragume;Username=ragume;Password=ragume",
        npgsqlOptions => npgsqlOptions.MigrationsAssembly(typeof(RagumeDbContext).Assembly.GetName().Name!)));

builder.Services.AddSingleton(sp => KernelFactory.Create(builder.Configuration));

builder.Services.AddScoped(sp => new SafetyAgent(
    sp.GetRequiredService<Kernel>(),
    builder.Configuration,
    sp.GetRequiredService<SafetyValidator>(),
    sp.GetRequiredService<PromptTemplateRepository>(),
    sp.GetRequiredService<ILogger<SafetyAgent>>()));

builder.Services.AddScoped(sp => new RagService(
    sp.GetRequiredService<Kernel>(),
    sp.GetRequiredService<DocumentsRepository>(),
    sp.GetRequiredService<PromptTemplateRepository>(),
    sp.GetRequiredService<ILogger<RagService>>()));

var app = builder.Build();

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyHeader()
    .AllowAnyMethod());

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/contact", async Task<IResult> (ContactRequest request, IConfiguration configuration, RecaptchaValidator recaptchaValidator, ILogger<Program> logger, CancellationToken cancellationToken) =>
{
    logger.LogInformation("Received contact request from {Name} <{Email}>.", request?.Name, request?.Email);

    if (request is null)
    {
        logger.LogWarning("Contact request body was missing.");
        return Results.BadRequest(new { message = "Request body is required." });
    }

    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
    {
        logger.LogWarning("Contact request rejected because one or more required fields were empty.");
        return Results.BadRequest(new { message = "Name, email, and message are required." });
    }

    logger.LogInformation("Validating recaptcha for contact request. Token present: {HasToken}.", !string.IsNullOrWhiteSpace(request.Token));
    var isCaptchaValid = await recaptchaValidator.ValidateAsync(request.Token, "contact", cancellationToken);
    if (!isCaptchaValid)
    {
        logger.LogWarning("Contact request rejected because recaptcha verification failed.");
        return Results.BadRequest(new { message = "Captcha verification failed. Please try again." });
    }

    try
    {
        _ = new MailAddress(request.Email);
    }
    catch
    {
        logger.LogWarning("Contact request rejected because the provided email was invalid.");
        return Results.BadRequest(new { message = "Please provide a valid email address." });
    }

    var recipientEmail = configuration["Contact:ToEmail"] ?? configuration["Contact:RecipientEmail"];
    if (string.IsNullOrWhiteSpace(recipientEmail))
    {
        logger.LogError("Contact email recipient is not configured in appsettings.");
        return Results.Problem("Contact email configuration is missing.", statusCode: StatusCodes.Status500InternalServerError);
    }

    var smtpHost = configuration["Contact:Smtp:Host"] ?? string.Empty;
    var smtpPortText = configuration["Contact:Smtp:Port"] ?? "587";
    var smtpUsername = configuration["Contact:Smtp:Username"];
    var smtpPassword = configuration["Contact:Smtp:Password"];
    var smtpEnableSslText = configuration["Contact:Smtp:EnableSsl"] ?? "true";
    var fromEmail = configuration["Contact:FromEmail"] ?? request.Email;

    var smtpIsPlaceholder = string.IsNullOrWhiteSpace(smtpHost)
        || smtpHost.Contains("example.com", StringComparison.OrdinalIgnoreCase)
        || smtpHost.Equals("localhost", StringComparison.OrdinalIgnoreCase);

    if (smtpIsPlaceholder)
    {
        logger.LogError("Contact email could not be sent because SMTP is not configured for this environment. Host: '{SmtpHost}'.", smtpHost);
        return Results.Problem("SMTP is not configured for this environment. Contact delivery is disabled until valid mail settings are provided.", statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    if (!int.TryParse(smtpPortText, out var smtpPort))
    {
        smtpPort = 587;
    }

    if (!bool.TryParse(smtpEnableSslText, out var smtpEnableSsl))
    {
        smtpEnableSsl = true;
    }

    try
    {
        using var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = $"New contact message from {request.Name}",
            Body = $"Name: {request.Name}\nEmail: {request.Email}\n\nMessage:\n{request.Message}",
            IsBodyHtml = false,
        };
        mailMessage.To.Add(recipientEmail);

        using var smtpClient = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = string.IsNullOrWhiteSpace(smtpUsername) || string.IsNullOrWhiteSpace(smtpPassword)
                ? CredentialCache.DefaultNetworkCredentials
                : new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = smtpEnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
        };

        await smtpClient.SendMailAsync(mailMessage, cancellationToken);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to send contact email from {SenderName}<{SenderEmail}>.", request.Name, request.Email);
        return Results.Problem("Unable to send the message right now. Please try again later.", statusCode: StatusCodes.Status500InternalServerError);
    }

    logger.LogInformation("Contact email sent successfully to {RecipientEmail}.", recipientEmail);
    return Results.Ok(new { message = "Your message was sent successfully." });
});

app.MapPost("/api/query", async Task<IResult> (HttpContext httpContext, SafetyAgent safetyAgent, RagService ragService, RagumeDbContext dbContext, RecaptchaValidator recaptchaValidator, ILogger<Program> logger, CancellationToken cancellationToken) =>
{
    using var timeoutCancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    timeoutCancellationSource.CancelAfter(TimeSpan.FromSeconds(30));

    var requestBody = await httpContext.Request.ReadFromJsonAsync<QueryRequest>(cancellationToken: timeoutCancellationSource.Token);
    var input = requestBody?.Input ?? requestBody?.Question;

    logger.LogInformation("Received query request with input {Input}. Token present: {HasToken}.", input, !string.IsNullOrWhiteSpace(requestBody?.Token));

    if (string.IsNullOrWhiteSpace(input))
    {
        logger.LogWarning("Query request rejected because input was empty or missing.");
        return Results.BadRequest(new { message = "Input is required." });
    }

    logger.LogInformation("Validating recaptcha for query request. Token present: {HasToken}.", !string.IsNullOrWhiteSpace(requestBody?.Token));
    var isCaptchaValid = await recaptchaValidator.ValidateAsync(requestBody?.Token, "query", timeoutCancellationSource.Token);
    if (!isCaptchaValid)
    {
        logger.LogWarning("Query request rejected because recaptcha verification failed.");
        return Results.BadRequest(new { message = "Captcha verification failed. Please try again." });
    }

    logger.LogInformation("Received query request with input length {InputLength}.", input.Length);

    try
    {
        var safety = await safetyAgent.ValidateAsync(input, timeoutCancellationSource.Token);
        if (!safety.IsSafe)
        {
            logger.LogWarning("Query request rejected by safety validation. Reason: {Reason}", safety.Reason);
            return Results.Json(
                new { message = "Your input was deemed irrelevant or unsafe and could not be processed." },
                statusCode: StatusCodes.Status400BadRequest);
        }

        httpContext.Response.StatusCode = StatusCodes.Status200OK;
        httpContext.Response.ContentType = "text/plain; charset=utf-8";
        httpContext.Response.Headers.CacheControl = "no-store";

        await foreach (var chunk in ragService.QueryStreamAsync(input, timeoutCancellationSource.Token))
        {
            await httpContext.Response.WriteAsync(chunk, timeoutCancellationSource.Token);
            await httpContext.Response.Body.FlushAsync(timeoutCancellationSource.Token);
        }

        logger.LogInformation("Query request completed successfully.");
        return Results.Empty;
    }
    catch (OperationCanceledException) when (timeoutCancellationSource.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
    {
        logger.LogWarning("Query request timed out after 30 seconds.");
        return Results.Json(new { message = "The request timed out after 30 seconds." }, statusCode: StatusCodes.Status408RequestTimeout);
    }
});

app.Run();

public sealed record ContactRequest(string Name, string Email, string Message, string? Token = null);
public sealed record QueryRequest(string? Input, string? Question, string? Token = null);
