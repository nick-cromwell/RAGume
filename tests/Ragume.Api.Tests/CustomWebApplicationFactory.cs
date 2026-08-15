using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Ragume.Api.Tests;

public sealed class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:Default"] = "Host=localhost;Port=5432;Database=ragume;Username=ragume;Password=ragume",
                    ["AI:Provider"] = "ollama",
                    ["AI:OpenAI:ChatModel"] = "gpt-4.1-nano",
                    ["AI:Ollama:BaseUrl"] = "http://localhost:11434",
                    ["AI:Ollama:ChatModel"] = "llama3.2",
                    ["Embeddings:Provider"] = "ollama",
                    ["Embeddings:Model"] = "nomic-embed-text",
                    ["Embeddings:Dimension"] = "768",
                    ["Recaptcha:Enabled"] = "false",
                    ["Recaptcha:SecretKey"] = ""
                })
                .Build();

            configBuilder.AddConfiguration(config);
        });
    }
}
