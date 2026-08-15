using Microsoft.EntityFrameworkCore;

namespace Ragume.Data;

public sealed class RagumeDbContext : DbContext
{
    public RagumeDbContext(DbContextOptions<RagumeDbContext> options)
        : base(options)
    {
    }

    public DbSet<PromptTemplate> PromptTemplates => Set<PromptTemplate>();
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<Document>(entity =>
        {
            entity.ToTable("documents");
            entity.Property(document => document.Content).HasColumnType("text");
            entity.Property(document => document.Embedding).HasColumnType("vector(768)");
            entity.Property(document => document.Metadata).HasColumnType("jsonb");
        });

        base.OnModelCreating(modelBuilder);
    }
}
