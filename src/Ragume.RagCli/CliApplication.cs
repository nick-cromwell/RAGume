using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Ragume.Data;
using Ragume.KernelFactory;

namespace Ragume.RagCli;

public sealed class CliApplication
{
    public static async Task<int> RunAsync(string[] args)
    {
        var outputDirectory = AppContext.BaseDirectory;
        var configuration = BuildConfiguration(outputDirectory);
        var options = CliOptions.From(args, configuration);

        await using var dbContext = new RagumeDbContext(CreateDbContextOptions(options.ConnectionString));

        if (options.ShouldClean)
        {
            Console.WriteLine("Cleaning database schema (dropping all tables including EF migration metadata).");
            await dbContext.Database.ExecuteSqlRawAsync("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
            Console.WriteLine("Database clean complete. Exiting without migrations or seeding.");
            return 0;
        }

        var kernel = Ragume.KernelFactory.KernelFactory.Create(configuration);
        var documentsRepository = new DocumentsRepository(configuration, kernel, dbContext);
        var documentsSeed = new DocumentsSeed(documentsRepository);

        var factsPath = documentsSeed.ResolveFactsPath(args, outputDirectory, options.FactsFileName);
        var facts = await documentsSeed.LoadFactsAsync(factsPath);
        if (facts.Count == 0)
        {
            Console.Error.WriteLine($"No profile facts were found at '{factsPath}'.");
            return 1;
        }

        await dbContext.Database.MigrateAsync();

        var promptTemplateSeed = new PromptTemplateSeed(outputDirectory);
        await promptTemplateSeed.SeedAsync(dbContext, CancellationToken.None);

        await documentsSeed.SeedFactsAsync(facts, dbContext);
        Console.WriteLine($"Seeded {facts.Count} profile facts with embeddings using {options.Provider}.");

        return 0;
    }

    private static IConfiguration BuildConfiguration(string outputDirectory)
    {
        var environmentName = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Production";

        return new ConfigurationBuilder()
            .SetBasePath(outputDirectory)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddJsonFile($"appsettings.{environmentName}.json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();
    }

    private static DbContextOptions<RagumeDbContext> CreateDbContextOptions(string connectionString)
    {
        return new DbContextOptionsBuilder<RagumeDbContext>()
            .UseNpgsql(connectionString)
            .Options;
    }
}
