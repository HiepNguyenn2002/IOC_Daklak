using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Backend.Models;

public sealed class NewsCategoryInfo
{
    public required string Slug { get; init; }
    public required string Title { get; init; }
}

public sealed class ContentPageDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
}

public sealed class CategoryPageDto
{
    public string? Title { get; set; }
    public List<NewsPostDto> Posts { get; set; } = [];
}

public sealed class NewsPostDto
{
    public string? Id { get; set; }
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public string? Source { get; set; }
    public string? Content { get; set; }
    public string? LinkUrl { get; set; }
    public string? LinkText { get; set; }
    public string? CreatedAt { get; set; }
}

public sealed class UserDto
{
    public string? Id { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? RegisterDate { get; set; }
    public string? Email { get; set; }
    public string? DateOfBirth { get; set; }
    public string? AvatarUrl { get; set; }
    public string? FullName { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class AuthResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public UserDto? User { get; set; }
    public string? AccessToken { get; set; }
    public string TokenType { get; set; } = "Bearer";
    public string? ExpiresAt { get; set; }
}

public sealed class CommentDto
{
    public string? Id { get; set; }
    public string? PageId { get; set; }
    public string? Username { get; set; }
    public string? Content { get; set; }
    public int Likes { get; set; }
    public int Dislikes { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CreatedAt { get; set; }
}

public sealed class AnnouncementDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? Url { get; set; }
    public string? PublishedAt { get; set; }
}

public sealed class DocumentTypeDto
{
    public int Id { get; set; }
    public string? Code { get; set; }
    public string? Name { get; set; }
    public int DisplayOrder { get; set; }
}

public sealed class DocumentDto
{
    public int Id { get; set; }
    public string? TypeCode { get; set; }
    public string? TypeName { get; set; }
    public string? DocumentNumber { get; set; }
    public string? PublishedAt { get; set; }
    public string? Title { get; set; }
    public string? FileUrl { get; set; }
    public string? IssuingAuthority { get; set; }
}

public sealed class SearchResultDto
{
    public string? Type { get; set; }
    public string? Title { get; set; }
    public string? Summary { get; set; }
    public string? Url { get; set; }
    public string? PublishedAt { get; set; }
}

public sealed class HomePageDto
{
    public JsonObject Config { get; set; } = [];
    public List<NewsPostDto> FeaturedNews { get; set; } = [];
    public List<AnnouncementDto> Announcements { get; set; } = [];
    public List<DocumentTypeDto> DocumentTypes { get; set; } = [];
    public List<DocumentDto> Documents { get; set; } = [];
}

public sealed class UploadOptions
{
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
}

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "IOC_Daklak";
    public string Audience { get; set; } = "IOC_Daklak_Frontend";
    public string SigningKey { get; set; } = "IOC_Daklak_dev_signing_key_change_before_production_2026";
    public int ExpiresMinutes { get; set; } = 120;
}
