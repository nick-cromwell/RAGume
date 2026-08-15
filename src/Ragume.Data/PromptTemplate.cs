using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ragume.Data;

[Table("prompt_templates")]
public sealed class PromptTemplate
{
    [Key]
    [Column("key")]
    public string Key { get; set; } = string.Empty;

    [Required]
    [Column("template")]
    public string Template { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
