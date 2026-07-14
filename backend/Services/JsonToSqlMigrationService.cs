using System.Text.Json;
using System.Text.Json.Nodes;
using Backend.Models;

namespace Backend.Services;

public sealed class JsonToSqlMigrationService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IPortalDataStore _store;
    private readonly IReadOnlyList<NewsCategoryInfo> _newsCategories;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public JsonToSqlMigrationService(
        IWebHostEnvironment environment,
        IPortalDataStore store,
        IReadOnlyList<NewsCategoryInfo> newsCategories)
    {
        _environment = environment;
        _store = store;
        _newsCategories = newsCategories;
    }

    public async Task<MigrationReport> MigrateAsync(CancellationToken cancellationToken)
    {
        var report = new MigrationReport();
        var dataDir = Path.Combine(_environment.ContentRootPath, "data");

        await MigrateConfigAsync(dataDir, report, cancellationToken);
        await MigrateContentPagesAsync(dataDir, report, cancellationToken);
        await MigrateNewsCategoriesAsync(dataDir, report, cancellationToken);
        await MigrateMainNewsAsync(dataDir, report, cancellationToken);
        await MigrateUsersAsync(dataDir, report, cancellationToken);
        await MigrateCommentsAsync(dataDir, report, cancellationToken);

        return report;
    }

    private async Task MigrateConfigAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var node = await ReadJsonAsync<JsonObject>(dataDir, "cau-hinh.json", report, cancellationToken);
        if (node is null)
        {
            return;
        }

        await _store.SaveConfigAsync(node, cancellationToken);
        report.CompletedSteps.Add($"Đã migrate cấu hình giao diện: {node.Count} khóa.");
    }

    private async Task MigrateContentPagesAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var slugs = new[]
        {
            "chuc-nang-nhiem-vu",
            "dau-moi-ho-tro",
            "lich-su-hinh-thanh",
            "san-pham-tieu-bieu",
            "so-do-to-chuc",
            "co-cau-to-chuc"
        };

        var count = 0;
        foreach (var slug in slugs)
        {
            var page = await ReadJsonAsync<ContentPageDto>(dataDir, $"{slug}.json", report, cancellationToken);
            if (page is null)
            {
                continue;
            }

            await _store.SaveContentPageAsync(slug, page, cancellationToken);
            count++;
        }

        report.CompletedSteps.Add($"Đã migrate trang nội dung: {count}/{slugs.Length} trang.");
    }

    private async Task MigrateNewsCategoriesAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var count = 0;
        var postCount = 0;

        foreach (var category in _newsCategories)
        {
            var page = await ReadJsonAsync<CategoryPageDto>(dataDir, $"{category.Slug}.json", report, cancellationToken);
            if (page is null)
            {
                continue;
            }

            page.Title ??= category.Title;
            await _store.SaveNewsCategoryAsync(category, page, cancellationToken);
            count++;
            postCount += page.Posts.Count;
        }

        report.CompletedSteps.Add($"Đã migrate chuyên mục tin: {count}/{_newsCategories.Count} chuyên mục, {postCount} bài viết.");
    }

    private async Task MigrateMainNewsAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var posts = await ReadJsonAsync<List<NewsPostDto>>(dataDir, "tin-tuc.json", report, cancellationToken);
        if (posts is null)
        {
            return;
        }

        foreach (var post in posts)
        {
            await _store.AddMainNewsAsync(post, cancellationToken);
        }

        report.CompletedSteps.Add($"Đã migrate tin nổi bật riêng: {posts.Count} bài viết.");
    }

    private async Task MigrateUsersAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var users = await ReadJsonAsync<List<UserDto>>(dataDir, "nguoi-dung.json", report, cancellationToken);
        if (users is null)
        {
            return;
        }

        var successCount = 0;
        foreach (var user in users.Where(u => !string.IsNullOrWhiteSpace(u.Username)))
        {
            var existingUser = await _store.GetUserAsync(user.Username!, cancellationToken);
            var result = await _store.AdminSaveUserAsync(existingUser is null ? null : user.Username, user, cancellationToken);
            if (result.Success)
            {
                successCount++;
            }
            else
            {
                report.Warnings.Add($"Không migrate được user {user.Username}: {result.Message}");
            }
        }

        report.CompletedSteps.Add($"Đã migrate người dùng: {successCount}/{users.Count} tài khoản.");
    }

    private async Task MigrateCommentsAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var comments = await ReadJsonAsync<List<CommentDto>>(dataDir, "danh-sach-binh-luan.json", report, cancellationToken);
        if (comments is null)
        {
            return;
        }

        var successCount = 0;
        foreach (var comment in comments.Where(c =>
            !string.IsNullOrWhiteSpace(c.PageId) &&
            !string.IsNullOrWhiteSpace(c.Username) &&
            !string.IsNullOrWhiteSpace(c.Content)))
        {
            try
            {
                await _store.AddCommentAsync(comment, cancellationToken);
                successCount++;
            }
            catch (Exception ex)
            {
                report.Warnings.Add($"Không migrate được bình luận của {comment.Username} trên {comment.PageId}: {ex.Message}");
            }
        }

        report.CompletedSteps.Add($"Đã migrate bình luận: {successCount}/{comments.Count} bình luận.");
    }

    private async Task<T?> ReadJsonAsync<T>(string dataDir, string fileName, MigrationReport report, CancellationToken cancellationToken)
    {
        var path = Path.Combine(dataDir, fileName);
        if (!File.Exists(path))
        {
            report.Warnings.Add($"Không tìm thấy file {fileName}, bỏ qua.");
            return default;
        }

        try
        {
            await using var stream = File.OpenRead(path);
            return await JsonSerializer.DeserializeAsync<T>(stream, _jsonOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            report.Warnings.Add($"Không đọc được file {fileName}: {ex.Message}");
            return default;
        }
    }
}
