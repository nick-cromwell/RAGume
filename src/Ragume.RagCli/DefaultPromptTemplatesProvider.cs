using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace Ragume.RagCli;

public static class DefaultPromptTemplatesProvider
{
    private const string FileName = "default-prompts.yaml";

    public static IEnumerable<KeyValuePair<string, string>> Load(string baseDirectory)
    {
        var path = ConfigPath(baseDirectory);
        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"Default prompt template file was not found at '{path}'.", path);
        }

        var yaml = File.ReadAllText(path);
        var deserializer = new DeserializerBuilder()
            .WithNamingConvention(CamelCaseNamingConvention.Instance)
            .Build();

        var config = deserializer.Deserialize<PromptTemplateYamlConfig>(yaml);
        return (config?.Templates ?? [])
            .Select(template => new KeyValuePair<string, string>(template.Key, template.Value));
    }

    public static string ConfigPath(string baseDirectory)
    {
        return Path.Combine(baseDirectory, FileName);
    }

    private sealed class PromptTemplateYamlConfig
    {
        public List<PromptTemplateYamlEntry>? Templates { get; set; }
    }

    private sealed class PromptTemplateYamlEntry
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
