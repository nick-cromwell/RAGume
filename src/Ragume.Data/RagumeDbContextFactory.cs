using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Ragume.Data;

// Used only by EF Core tooling (dotnet ef) to construct the DbContext at design time.
public sealed class RagumeDbContextFactory : IDesignTimeDbContextFactory<RagumeDbContext>
{
    public RagumeDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("RAGUME_CONNECTION_STRING")
            ?? "Host=localhost;Port=5432;Database=ragume;Username=ragume;Password=ragume";

        var optionsBuilder = new DbContextOptionsBuilder<RagumeDbContext>()
            .UseNpgsql(connectionString);

        return new RagumeDbContext(optionsBuilder.Options);
    }
}
