using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ragume.Data;

public sealed class PromptTemplateRepository
{
    private readonly RagumeDbContext _dbContext;
    private readonly ILogger<PromptTemplateRepository>? _logger;

    public PromptTemplateRepository(RagumeDbContext dbContext, ILogger<PromptTemplateRepository>? logger = null)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<string> GetPromptAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var template = await _dbContext.PromptTemplates
                .AsNoTracking()
                .Where(prompt => prompt.Key == key)
                .Select(prompt => prompt.Template)
                .FirstOrDefaultAsync(cancellationToken);

            return template ?? string.Empty;
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Unable to retrieve prompt template '{Key}'.", key);
            return string.Empty;
        }
    }

    public async Task SeedDefaultTemplatesAsync(IEnumerable<KeyValuePair<string, string>> templates, CancellationToken cancellationToken = default)
    {
        foreach (var template in templates)
        {
            var existingTemplate = await _dbContext.PromptTemplates.FindAsync(new object?[] { template.Key }, cancellationToken);
            if (existingTemplate is null)
            {
                _dbContext.PromptTemplates.Add(new PromptTemplate
                {
                    Key = template.Key,
                    Template = template.Value,
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }
            else
            {
                existingTemplate.Template = template.Value;
                existingTemplate.CreatedAt = DateTimeOffset.UtcNow;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
