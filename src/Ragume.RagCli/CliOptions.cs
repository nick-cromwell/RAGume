using Microsoft.Extensions.Configuration;

namespace Ragume.RagCli;

public sealed class CliOptions
{
    public string ConnectionString { get; }
    public string Provider { get; }
    public string FactsFileName { get; }
    public bool ShouldClean { get; }

    private CliOptions(string connectionString, string provider, string factsFileName, bool shouldClean)
    {
        ConnectionString = connectionString;
        Provider = provider;
        FactsFileName = factsFileName;
        ShouldClean = shouldClean;
    }

    public static CliOptions From(string[] args, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? "Host=localhost;Port=5432;Database=ragume;Username=ragume;Password=ragume";

        var provider = (configuration["Embeddings:Provider"]
            ?? configuration["AI:Provider"]
            ?? configuration["Provider"]
            ?? "ollama").Trim();

        var factsFileName = configuration["Seeding:FactsFileName"] ?? "profile-facts.txt";

        return new CliOptions(
            connectionString,
            provider,
            factsFileName,
            args.Contains("--clean", StringComparer.OrdinalIgnoreCase)
                || args.Contains("-clean", StringComparer.OrdinalIgnoreCase));
    }
}
