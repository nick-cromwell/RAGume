using Microsoft.Extensions.VectorData;

namespace Ragume.Data;

public sealed class Document
{
    [VectorStoreKey]
    public int Id { get; set; }

    [VectorStoreData]
    public string Content { get; set; } = string.Empty;

    [VectorStoreVector(768)]
    public string Embedding { get; set; } = string.Empty;

    [VectorStoreData]
    public string? Metadata { get; set; }
}
