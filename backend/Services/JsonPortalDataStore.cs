using System.Text.Json;
using System.Text.Json.Nodes;
using Backend.Models;

namespace Backend.Services;

public sealed class JsonPortalDataStore : IPortalDataStore
{
    private readonly string _dataDir;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public JsonPortalDataStore(IWebHostEnvironment environment)
    {
        _dataDir = Path.Combine(environment.ContentRootPath, "data");
        Directory.CreateDirectory(_dataDir);
    }

    public async Task<JsonObject> GetConfigAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("cau-hinh.json", "{}", cancellationToken);
        return JsonNode.Parse(json)?.AsObject() ?? [];
    }

    public async Task SaveConfigAsync(JsonObject config, CancellationToken cancellationToken)
    {
        await WriteFileAsync("cau-hinh.json", config.ToJsonString(_jsonOptions), cancellationToken);
    }

    public async Task<ContentPageDto> GetContentPageAsync(string slug, CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync($"{slug}.json", "{\"title\":\"\",\"content\":\"\"}", cancellationToken);
        return JsonSerializer.Deserialize<ContentPageDto>(json, _jsonOptions) ?? new ContentPageDto();
    }

    public async Task SaveContentPageAsync(string slug, ContentPageDto page, CancellationToken cancellationToken)
    {
        await WriteFileAsync($"{slug}.json", JsonSerializer.Serialize(page, _jsonOptions), cancellationToken);
    }

    public async Task<CategoryPageDto> GetNewsCategoryAsync(NewsCategoryInfo category, CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync($"{category.Slug}.json", JsonSerializer.Serialize(new CategoryPageDto { Title = category.Title }, _jsonOptions), cancellationToken);
        return JsonSerializer.Deserialize<CategoryPageDto>(json, _jsonOptions) ?? new CategoryPageDto { Title = category.Title };
    }

    public async Task SaveNewsCategoryAsync(NewsCategoryInfo category, CategoryPageDto page, CancellationToken cancellationToken)
    {
        page.Title ??= category.Title;
        await WriteFileAsync($"{category.Slug}.json", JsonSerializer.Serialize(page, _jsonOptions), cancellationToken);
    }

    public async Task<List<NewsPostDto>> GetMainNewsAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("tin-tuc.json", "[]", cancellationToken);
        return JsonSerializer.Deserialize<List<NewsPostDto>>(json, _jsonOptions) ?? [];
    }

    public async Task AddMainNewsAsync(NewsPostDto post, CancellationToken cancellationToken)
    {
        var posts = await GetMainNewsAsync(cancellationToken);
        post.Id ??= DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
        post.CreatedAt ??= DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        posts.Insert(0, post);
        await WriteFileAsync("tin-tuc.json", JsonSerializer.Serialize(posts, _jsonOptions), cancellationToken);
    }

    public async Task<List<UserDto>> GetUsersAsync(CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        return users.Select(ToSafeUser).ToList();
    }

    public async Task<UserDto?> GetUserAsync(string username, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        var user = users.FirstOrDefault(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
        return user is null ? null : ToSafeUser(user);
    }

    public async Task<UserDto?> LoginAsync(string username, string password, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        var user = users.FirstOrDefault(u =>
            string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase) &&
            PasswordService.VerifyPassword(password, u.Password ?? string.Empty));

        return user is null || !user.IsActive ? null : ToSafeUser(user);
    }

    public async Task<(bool Success, string Message, UserDto? User)> RegisterAsync(UserDto user, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        if (users.Any(u => string.Equals(u.Username, user.Username, StringComparison.OrdinalIgnoreCase)))
        {
            return (false, "Tên đăng nhập đã tồn tại.", null);
        }

        user.Id = Guid.NewGuid().ToString();
        user.RegisterDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        user.Password = PasswordService.HashPassword(user.Password ?? string.Empty);
        user.IsActive = true;
        users.Add(user);
        await WriteUsersAsync(users, cancellationToken);
        return (true, "Đăng ký thành công.", ToSafeUser(user));
    }

    public async Task<(bool Success, string Message, UserDto? User)> UpdateUserAsync(string username, UserDto user, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        var index = users.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
        if (index < 0)
        {
            return (false, "Không tìm thấy người dùng.", null);
        }

        var current = users[index];
        if (!string.IsNullOrWhiteSpace(user.Password)) current.Password = PasswordService.HashPassword(user.Password);
        if (user.Email is not null) current.Email = user.Email;
        if (user.DateOfBirth is not null) current.DateOfBirth = user.DateOfBirth;
        if (user.AvatarUrl is not null) current.AvatarUrl = user.AvatarUrl;
        if (user.FullName is not null) current.FullName = user.FullName;

        users[index] = current;
        await WriteUsersAsync(users, cancellationToken);
        return (true, "Cập nhật thành công.", ToSafeUser(current));
    }

    public async Task<(bool Success, string Message)> AdminSaveUserAsync(string? username, UserDto user, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        var index = string.IsNullOrWhiteSpace(username)
            ? -1
            : users.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));

        if (index < 0)
        {
            if (users.Any(u => string.Equals(u.Username, user.Username, StringComparison.OrdinalIgnoreCase)))
            {
                return (false, "Tên đăng nhập đã tồn tại.");
            }

            user.Id = Guid.NewGuid().ToString();
            user.RegisterDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            user.Password = PasswordService.HashPassword(string.IsNullOrWhiteSpace(user.Password) ? "123456" : user.Password);
            users.Add(user);
            await WriteUsersAsync(users, cancellationToken);
            return (true, "Thêm tài khoản thành công.");
        }

        var current = users[index];
        if (!string.IsNullOrWhiteSpace(user.Password)) current.Password = PasswordService.HashPassword(user.Password);
        if (user.FullName is not null) current.FullName = user.FullName;
        if (user.Email is not null) current.Email = user.Email;
        current.IsActive = user.IsActive;
        users[index] = current;
        await WriteUsersAsync(users, cancellationToken);
        return (true, "Cập nhật tài khoản thành công.");
    }

    public async Task<(bool Success, string Message)> AdminDeleteUserAsync(string username, CancellationToken cancellationToken)
    {
        if (string.Equals(username, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Không thể xóa tài khoản admin gốc.");
        }

        var users = await ReadUsersAsync(cancellationToken);
        var removed = users.RemoveAll(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
        if (removed == 0)
        {
            return (false, "Không tìm thấy người dùng.");
        }

        await WriteUsersAsync(users, cancellationToken);
        return (true, "Đã xóa tài khoản.");
    }

    public async Task<List<CommentDto>> GetCommentsAsync(string pageId, CancellationToken cancellationToken)
    {
        var comments = await ReadCommentsAsync(cancellationToken);
        return comments.Where(c => string.Equals(c.PageId, pageId, StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public async Task<CommentDto> AddCommentAsync(CommentDto comment, CancellationToken cancellationToken)
    {
        var comments = await ReadCommentsAsync(cancellationToken);
        var users = await ReadUsersAsync(cancellationToken);
        var user = users.FirstOrDefault(u => string.Equals(u.Username, comment.Username, StringComparison.OrdinalIgnoreCase));

        comment.Id = Guid.NewGuid().ToString();
        comment.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        comment.Likes = 0;
        comment.Dislikes = 0;
        comment.AvatarUrl = user?.AvatarUrl ?? string.Empty;
        comments.Add(comment);

        await WriteFileAsync("danh-sach-binh-luan.json", JsonSerializer.Serialize(comments, _jsonOptions), cancellationToken);
        return comment;
    }

    public async Task<int?> VoteCommentAsync(string id, bool isLike, CancellationToken cancellationToken)
    {
        var comments = await ReadCommentsAsync(cancellationToken);
        var comment = comments.FirstOrDefault(c => string.Equals(c.Id, id, StringComparison.OrdinalIgnoreCase));
        if (comment is null)
        {
            return null;
        }

        if (isLike) comment.Likes++;
        else comment.Dislikes++;

        await WriteFileAsync("danh-sach-binh-luan.json", JsonSerializer.Serialize(comments, _jsonOptions), cancellationToken);
        return isLike ? comment.Likes : comment.Dislikes;
    }

    public Task<List<AnnouncementDto>> GetAnnouncementsAsync(int take, CancellationToken cancellationToken)
    {
        return Task.FromResult(new List<AnnouncementDto>());
    }

    public Task<List<DocumentTypeDto>> GetDocumentTypesAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult(new List<DocumentTypeDto>());
    }

    public Task<List<DocumentDto>> GetDocumentsAsync(string? typeCode, int take, CancellationToken cancellationToken)
    {
        return Task.FromResult(new List<DocumentDto>());
    }

    public async Task<List<SearchResultDto>> SearchAsync(string keyword, int take, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return [];
        }

        var normalizedKeyword = keyword.Trim();
        var results = new List<SearchResultDto>();

        foreach (var fileName in Directory.EnumerateFiles(_dataDir, "*.json"))
        {
            var slug = Path.GetFileNameWithoutExtension(fileName);
            var json = await File.ReadAllTextAsync(fileName, cancellationToken);
            if (!json.Contains(normalizedKeyword, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            results.Add(new SearchResultDto
            {
                Type = "json",
                Title = slug,
                Summary = "Kết quả tìm thấy trong dữ liệu JSON.",
                Url = "#"
            });

            if (results.Count >= take)
            {
                break;
            }
        }

        return results;
    }

    public async Task<HomePageDto> GetHomePageAsync(CancellationToken cancellationToken)
    {
        return new HomePageDto
        {
            Config = await GetConfigAsync(cancellationToken),
            FeaturedNews = await GetMainNewsAsync(cancellationToken),
            Announcements = await GetAnnouncementsAsync(5, cancellationToken),
            DocumentTypes = await GetDocumentTypesAsync(cancellationToken),
            Documents = await GetDocumentsAsync(null, 10, cancellationToken)
        };
    }

    private async Task<List<UserDto>> ReadUsersAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("nguoi-dung.json", "[]", cancellationToken);
        return JsonSerializer.Deserialize<List<UserDto>>(json, _jsonOptions) ?? [];
    }

    private Task WriteUsersAsync(List<UserDto> users, CancellationToken cancellationToken)
    {
        return WriteFileAsync("nguoi-dung.json", JsonSerializer.Serialize(users, _jsonOptions), cancellationToken);
    }

    private async Task<List<CommentDto>> ReadCommentsAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("danh-sach-binh-luan.json", "[]", cancellationToken);
        return JsonSerializer.Deserialize<List<CommentDto>>(json, _jsonOptions) ?? [];
    }

    private async Task<string> ReadFileAsync(string fileName, string defaultJson, CancellationToken cancellationToken)
    {
        var path = Path.Combine(_dataDir, fileName);
        if (!File.Exists(path))
        {
            await File.WriteAllTextAsync(path, defaultJson, cancellationToken);
        }

        return await File.ReadAllTextAsync(path, cancellationToken);
    }

    private Task WriteFileAsync(string fileName, string json, CancellationToken cancellationToken)
    {
        var path = Path.Combine(_dataDir, fileName);
        return File.WriteAllTextAsync(path, json, cancellationToken);
    }

    private static UserDto ToSafeUser(UserDto user)
    {
        // Không trả mật khẩu ra frontend, kể cả khi dữ liệu cũ vẫn còn lưu trong JSON.
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            RegisterDate = user.RegisterDate,
            Email = user.Email,
            DateOfBirth = user.DateOfBirth,
            AvatarUrl = user.AvatarUrl,
            FullName = user.FullName,
            IsActive = user.IsActive
        };
    }
}
