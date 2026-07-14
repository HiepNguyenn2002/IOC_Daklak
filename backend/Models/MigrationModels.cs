namespace Backend.Models;

public sealed class MigrationReport
{
    public List<string> CompletedSteps { get; } = [];
    public List<string> Warnings { get; } = [];
}
