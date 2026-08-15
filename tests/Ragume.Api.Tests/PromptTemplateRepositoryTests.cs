using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Ragume.Data;

namespace Ragume.Api.Tests;

public sealed class PromptTemplateRepositoryTests
{
    [Fact]
    public async Task GetPromptAsync_ReturnsTemplateForKey_WhenDatabaseIsAvailable()
    {
        var options = new DbContextOptionsBuilder<RagumeDbContext>()
            .UseNpgsql("Host=localhost;Port=5432;Database=ragume;Username=ragume;Password=ragume")
            .Options;

        await using var dbContext = new RagumeDbContext(options);
        var repository = new PromptTemplateRepository(dbContext);

        var prompt = await repository.GetPromptAsync("safety.score");

        Assert.False(string.IsNullOrWhiteSpace(prompt));
        Assert.Contains("safety evaluator", prompt, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetPromptAsync_ReturnsEmptyString_WhenLookupFails()
    {
        var options = new DbContextOptionsBuilder<RagumeDbContext>()
            .UseNpgsql("Host=127.0.0.1;Port=1;Database=doesnotexist;Username=bad;Password=bad;Timeout=1")
            .Options;

        await using var dbContext = new RagumeDbContext(options);
        var logger = new TestLogger<PromptTemplateRepository>();
        var repository = new PromptTemplateRepository(dbContext, logger);

        var prompt = await repository.GetPromptAsync("missing-key");

        Assert.Equal(string.Empty, prompt);
        Assert.Contains(logger.Entries, entry => entry.Level == LogLevel.Error);
    }

    private sealed class TestLogger<T> : ILogger<T>
    {
        public List<LogEntry> Entries { get; } = [];

        public IDisposable BeginScope<TState>(TState state) where TState : notnull => NullScope.Instance;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            Entries.Add(new LogEntry(logLevel, formatter(state, exception)));
        }
    }

    private sealed class NullScope : IDisposable
    {
        public static NullScope Instance { get; } = new();

        public void Dispose()
        {
        }
    }

    public sealed record LogEntry(LogLevel Level, string Message);
}
