using Ragume.Data;

namespace Ragume.RagCli;

public sealed class PromptTemplateSeed
{
    private readonly string _baseDirectory;

    public PromptTemplateSeed(string baseDirectory)
    {
        _baseDirectory = baseDirectory;
    }

    public async Task SeedAsync(RagumeDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var defaultTemplates = DefaultPromptTemplatesProvider.Load(_baseDirectory);
        var promptRepository = new PromptTemplateRepository(dbContext);
        await promptRepository.SeedDefaultTemplatesAsync(defaultTemplates, cancellationToken);

        Console.WriteLine($"Prompt templates seeded from '{DefaultPromptTemplatesProvider.ConfigPath(_baseDirectory)}'.");
    }
}
