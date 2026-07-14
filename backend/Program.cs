using System.Text.Json.Nodes;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var pascalCaseJson = new JsonSerializerOptions { PropertyNamingPolicy = null };
var projectRoot = Directory.GetParent(builder.Environment.ContentRootPath)?.FullName
    ?? builder.Environment.ContentRootPath;
var frontendRoot = projectRoot;

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.Configure<UploadOptions>(builder.Configuration.GetSection("Upload"));
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
var jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = jwtKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Cho phép frontend tĩnh gọi API trong giai đoạn phát triển.
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddSingleton(GetNewsCategories());
builder.Services.AddSingleton<IPortalDataStore>(serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var provider = configuration["DataProvider"];

    // Cho phép chuyển nguồn dữ liệu bằng appsettings.json: "Json" để chạy nhanh, "SqlServer" để dùng database thật.
    if (string.Equals(provider, "SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        return new SqlServerPortalDataStore(configuration);
    }

    var environment = serviceProvider.GetRequiredService<IWebHostEnvironment>();
    return new JsonPortalDataStore(environment);
});
builder.Services.AddSingleton<JsonToSqlMigrationService>();
builder.Services.AddSingleton<AuthTokenService>();

var app = builder.Build();

app.UseCors();
app.UseStaticFiles();
UseFrontendStaticFiles(app, frontendRoot);
app.UseAuthentication();
app.UseAuthorization();

MapFrontendRoutes(app, frontendRoot);

app.MapGet("/api", (IConfiguration configuration) =>
{
    return Results.Json(new
    {
        success = true,
        service = "IOC Daklak Backend API",
        environment = app.Environment.EnvironmentName,
        dataProvider = configuration["DataProvider"] ?? "Json",
        health = "/api/health",
        apiBase = "/api"
    });
});

app.MapGet("/api/health", (IConfiguration configuration) =>
{
    return Results.Json(new
    {
        success = true,
        status = "Healthy",
        service = "IOC Daklak Backend API",
        dataProvider = configuration["DataProvider"] ?? "Json",
        checkedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
    });
});

app.MapGet("/api/auth/me", (ClaimsPrincipal user) =>
{
    return Results.Json(new
    {
        success = true,
        username = user.Identity?.Name,
        userId = user.FindFirstValue(ClaimTypes.NameIdentifier),
        role = user.FindFirstValue(ClaimTypes.Role)
    });
}).RequireAuthorization();

app.MapGet("/api/trang-chu", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetHomePageAsync(cancellationToken));
});

app.MapGet("/api/thong-bao-chung", async (int? take, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetAnnouncementsAsync(take ?? 5, cancellationToken));
});

app.MapGet("/api/loai-van-ban", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetDocumentTypesAsync(cancellationToken));
});

app.MapGet("/api/van-ban", async (string? type, int? take, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetDocumentsAsync(type, take ?? 20, cancellationToken));
});

app.MapGet("/api/tim-kiem", async (string? q, int? take, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(q))
    {
        return Results.BadRequest(new { success = false, message = "Vui lòng nhập từ khóa tìm kiếm." });
    }

    return Results.Json(new
    {
        success = true,
        keyword = q.Trim(),
        results = await store.SearchAsync(q, take ?? 20, cancellationToken)
    });
});

var contentPages = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    ["chuc-nang-nhiem-vu"] = "Trang chức năng, nhiệm vụ",
    ["dau-moi-ho-tro"] = "Trang đầu mối hỗ trợ",
    ["lich-su-hinh-thanh"] = "Trang lịch sử hình thành",
    ["san-pham-tieu-bieu"] = "Trang sản phẩm tiêu biểu",
    ["so-do-to-chuc"] = "Trang sơ đồ tổ chức",
    ["co-cau-to-chuc"] = "Trang cơ cấu tổ chức"
};

app.MapGet("/api/cau-hinh", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetConfigAsync(cancellationToken));
});

app.MapPost("/api/cau-hinh", async (JsonObject config, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.SaveConfigAsync(config, cancellationToken);
    return Results.Json(new { success = true, message = "Cấu hình đã được lưu." });
}).RequireAuthorization("AdminOnly");

foreach (var page in contentPages)
{
    var slug = page.Key;
    var label = page.Value;

    app.MapGet($"/api/{slug}", async (IPortalDataStore store, CancellationToken cancellationToken) =>
    {
        return Results.Json(await store.GetContentPageAsync(slug, cancellationToken));
    });

    app.MapPost($"/api/{slug}", async (ContentPageDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
    {
        await store.SaveContentPageAsync(slug, payload, cancellationToken);
        return Results.Json(new { success = true, message = $"{label} đã được lưu." });
    }).RequireAuthorization("AdminOnly");
}

var newsCategories = app.Services.GetRequiredService<IReadOnlyList<NewsCategoryInfo>>();
foreach (var category in newsCategories)
{
    app.MapGet($"/api/{category.Slug}", async (IPortalDataStore store, CancellationToken cancellationToken) =>
    {
        return Results.Json(await store.GetNewsCategoryAsync(category, cancellationToken));
    });

    app.MapPost($"/api/{category.Slug}", async (CategoryPageDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
    {
        await store.SaveNewsCategoryAsync(category, payload, cancellationToken);
        return Results.Json(new { success = true, message = $"Trang {category.Title} đã được lưu." });
    }).RequireAuthorization("AdminOnly");
}

app.MapGet("/api/tin-tuc", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetMainNewsAsync(cancellationToken));
});

// Giữ alias tiếng Anh vì một số file frontend cũ đang gọi /api/news.
app.MapGet("/api/news", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetMainNewsAsync(cancellationToken));
});

app.MapPost("/api/tin-tuc", async (NewsPostDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.AddMainNewsAsync(payload, cancellationToken);
    return Results.Json(new { success = true, message = "Đăng tin thành công." });
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/migrate-json", async (
    JsonToSqlMigrationService migrationService,
    IConfiguration configuration,
    CancellationToken cancellationToken) =>
{
    if (!string.Equals(configuration["DataProvider"], "SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        return (IResult)Results.BadRequest(new
        {
            success = false,
            message = "Chỉ chạy migrate JSON khi DataProvider đang là SqlServer."
        });
    }

    var report = await migrationService.MigrateAsync(cancellationToken);
    return (IResult)Results.Json(new { success = true, message = "Migrate JSON sang SQL Server hoàn tất.", report });
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/upload", async (
    HttpContext context,
    IWebHostEnvironment environment,
    IOptions<UploadOptions> uploadOptions,
    CancellationToken cancellationToken) =>
{
    if (!context.Request.HasFormContentType || !context.Request.Form.Files.Any())
    {
        return Results.BadRequest(new { success = false, message = "Không tìm thấy file." });
    }

    var file = context.Request.Form.Files[0];
    var options = uploadOptions.Value;
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

    if (!options.AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { success = false, message = "Định dạng file không được hỗ trợ." });
    }

    if (file.Length <= 0 || file.Length > options.MaxFileSizeBytes)
    {
        return Results.BadRequest(new { success = false, message = "Dung lượng file không hợp lệ." });
    }

    var webRootPath = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
    var uploadsDir = Path.Combine(webRootPath, "uploads");
    Directory.CreateDirectory(uploadsDir);

    // Sinh tên file mới để tránh ghi đè và tránh tin vào tên file người dùng gửi lên.
    var fileName = $"{Guid.NewGuid():N}{extension}";
    var filePath = Path.Combine(uploadsDir, fileName);

    await using var stream = new FileStream(filePath, FileMode.CreateNew);
    await file.CopyToAsync(stream, cancellationToken);

    return Results.Json(new { success = true, url = $"/uploads/{fileName}" });
}).RequireAuthorization();

app.MapGet("/api/nguoi-dung", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetUsersAsync(cancellationToken));
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/nguoi-dung/{username}", async (string username, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var user = await store.GetUserAsync(username, cancellationToken);
    return user is null
        ? (IResult)Results.NotFound(new { success = false, message = "Không tìm thấy người dùng." })
        : Results.Json(new { success = true, user });
});

app.MapPut("/api/nguoi-dung/{username}", async (string username, UserDto payload, IPortalDataStore store, ClaimsPrincipal user, CancellationToken cancellationToken) =>
{
    var currentUsername = user.Identity?.Name;
    var isAdmin = user.IsInRole("Admin");
    if (!isAdmin && !string.Equals(currentUsername, username, StringComparison.OrdinalIgnoreCase))
    {
        return Results.Forbid();
    }

    var result = await store.UpdateUserAsync(username, payload, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(new { success = true, message = result.Message, user = result.User })
        : Results.NotFound(new { success = false, message = result.Message });
}).RequireAuthorization();

app.MapPost("/api/register", async (UserDto payload, IPortalDataStore store, AuthTokenService tokenService, CancellationToken cancellationToken) =>
{
    var result = await store.RegisterAsync(payload, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(tokenService.CreateAuthResponse(result.User!, result.Message))
        : Results.BadRequest(new { success = false, message = result.Message });
});

app.MapPost("/api/login", async (UserDto payload, IPortalDataStore store, AuthTokenService tokenService, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(payload.Username) || string.IsNullOrWhiteSpace(payload.Password))
    {
        return Results.BadRequest(new { success = false, message = "Vui lòng nhập tên đăng nhập và mật khẩu." });
    }

    var user = await store.LoginAsync(payload.Username, payload.Password, cancellationToken);
    return user is null
        ? (IResult)Results.Json(new { success = false, message = "Sai tên đăng nhập hoặc mật khẩu." }, statusCode: StatusCodes.Status401Unauthorized)
        : Results.Json(tokenService.CreateAuthResponse(user, "Đăng nhập thành công."));
});

app.MapGet("/api/binh-luan", async (string pageId, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    // API bình luận cũ trả PascalCase, frontend hiện tại đang đọc trực tiếp các field này.
    return Results.Json(await store.GetCommentsAsync(pageId, cancellationToken), pascalCaseJson);
});

app.MapPost("/api/binh-luan", async (CommentDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var comment = await store.AddCommentAsync(payload, cancellationToken);
    return Results.Json(new { success = true, message = "Đã gửi bình luận.", comment });
});

app.MapPost("/api/binh-luan/{id}/like", async (string id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var likes = await store.VoteCommentAsync(id, isLike: true, cancellationToken);
    return likes is null
        ? (IResult)Results.NotFound(new { success = false, message = "Không tìm thấy bình luận." })
        : Results.Json(new { success = true, likes });
});

app.MapPost("/api/binh-luan/{id}/dislike", async (string id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var dislikes = await store.VoteCommentAsync(id, isLike: false, cancellationToken);
    return dislikes is null
        ? (IResult)Results.NotFound(new { success = false, message = "Không tìm thấy bình luận." })
        : Results.Json(new { success = true, dislikes });
});

app.MapPost("/api/admin/nguoi-dung", async (UserDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.AdminSaveUserAsync(null, payload, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(new { success = true, message = result.Message })
        : Results.BadRequest(new { success = false, message = result.Message });
}).RequireAuthorization("AdminOnly");

app.MapPut("/api/admin/nguoi-dung/{username}", async (string username, UserDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.AdminSaveUserAsync(username, payload, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(new { success = true, message = result.Message })
        : Results.NotFound(new { success = false, message = result.Message });
}).RequireAuthorization("AdminOnly");

app.MapDelete("/api/admin/nguoi-dung/{username}", async (string username, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.AdminDeleteUserAsync(username, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(new { success = true, message = result.Message })
        : Results.Json(new { success = false, message = result.Message }, statusCode: username.Equals("admin", StringComparison.OrdinalIgnoreCase) ? StatusCodes.Status403Forbidden : StatusCodes.Status404NotFound);
}).RequireAuthorization("AdminOnly");

app.Run();

static void UseFrontendStaticFiles(WebApplication app, string frontendRoot)
{
    var publicFolders = new[] { "admin", "auth", "profile", "shared", "user" };

    foreach (var folder in publicFolders)
    {
        var folderPath = Path.Combine(frontendRoot, folder);
        if (!Directory.Exists(folderPath))
        {
            continue;
        }

        // Chỉ public các thư mục frontend cần thiết, tránh vô tình lộ cấu hình backend/database.
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(folderPath),
            RequestPath = $"/{folder}"
        });
    }
}

static void MapFrontendRoutes(WebApplication app, string frontendRoot)
{
    var routes = GetFrontendRoutes();

    foreach (var route in routes)
    {
        var localRoute = route;
        app.MapGet(localRoute.Url, () => ServeFrontendPage(frontendRoot, localRoute.FilePath));
    }

    app.MapGet("/api/site-map", () => Results.Json(routes.Select(route => new
    {
        route.Url,
        route.FilePath,
        route.Area,
        route.Title
    })));
}

static IResult ServeFrontendPage(string frontendRoot, string relativePath)
{
    var fullPath = Path.GetFullPath(Path.Combine(frontendRoot, relativePath));
    var rootPath = Path.GetFullPath(frontendRoot);

    if (!fullPath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase) || !System.IO.File.Exists(fullPath))
    {
        return Results.NotFound(new { success = false, message = "Không tìm thấy trang frontend." });
    }

    return Results.File(fullPath, "text/html; charset=utf-8");
}

static IReadOnlyList<FrontendRouteInfo> GetFrontendRoutes()
{
    return
    [
        new("/", "user/trang-chu/trang-chu.html", "user", "Trang chủ"),
        new("/trang-chu", "user/trang-chu/trang-chu.html", "user", "Trang chủ"),

        new("/admin", "admin/quan-tri.html", "admin", "Quản trị"),
        new("/admin/quan-tri", "admin/quan-tri.html", "admin", "Quản trị"),
        new("/quan-tri", "admin/quan-tri.html", "admin", "Quản trị"),

        new("/auth", "auth/xac-thuc.html", "auth", "Xác thực"),
        new("/dang-nhap", "auth/xac-thuc.html", "auth", "Đăng nhập"),
        new("/dang-ky", "auth/xac-thuc.html", "auth", "Đăng ký"),

        new("/profile", "profile/ho-so.html", "profile", "Hồ sơ cá nhân"),
        new("/ho-so", "profile/ho-so.html", "profile", "Hồ sơ cá nhân"),

        new("/gioi-thieu/chuc-nang-nhiem-vu", "user/gioi-thieu/chuc-nang-nhiem-vu.html", "user", "Chức năng, nhiệm vụ"),
        new("/gioi-thieu/dau-moi-ho-tro", "user/gioi-thieu/dau-moi-ho-tro.html", "user", "Đầu mối hỗ trợ"),
        new("/gioi-thieu/lich-su-hinh-thanh", "user/gioi-thieu/lich-su-hinh-thanh.html", "user", "Lịch sử hình thành"),
        new("/gioi-thieu/san-pham-tieu-bieu", "user/gioi-thieu/san-pham-tieu-bieu.html", "user", "Sản phẩm tiêu biểu"),
        new("/gioi-thieu/so-do-to-chuc", "user/gioi-thieu/so-do-to-chuc.html", "user", "Sơ đồ tổ chức"),
        new("/gioi-thieu/co-cau-to-chuc", "user/gioi-thieu/co-cau-to-chuc.html", "user", "Cơ cấu tổ chức"),
        new("/co-cau-to-chuc", "user/gioi-thieu/co-cau-to-chuc.html", "user", "Cơ cấu tổ chức"),

        new("/tin-tuc/cap-nhat-bao-lu", "user/tin-tuc/cap-nhat-bao-lu.html", "user", "Cập nhật bão lũ"),
        new("/tin-tuc/cds-doi-moi-sang-tao", "user/tin-tuc/cds-doi-moi-sang-tao.html", "user", "CĐS - Đổi mới sáng tạo"),
        new("/tin-tuc/thong-bao", "user/tin-tuc/thong-bao.html", "user", "Thông báo"),
        new("/tin-tuc/tin-hoat-dong", "user/tin-tuc/tin-hoat-dong.html", "user", "Tin hoạt động"),

        new("/chuyen-muc-khac/chi-dao-dieu-hanh", "user/chuyen-muc-khac/chi-dao-dieu-hanh.html", "user", "Chỉ đạo điều hành"),
        new("/chuyen-muc-khac/cong-tac-xay-dung-dang", "user/chuyen-muc-khac/cong-tac-xay-dung-dang.html", "user", "Công tác xây dựng Đảng"),
        new("/chuyen-muc-khac/tieu-chuan-chat-luong", "user/chuyen-muc-khac/tieu-chuan-chat-luong.html", "user", "Tiêu chuẩn - Chất lượng"),
        new("/chuyen-muc-khac/trao-doi-kinh-nghiem", "user/chuyen-muc-khac/trao-doi-kinh-nghiem.html", "user", "Trao đổi kinh nghiệm"),
        new("/chuyen-muc-khac/tuong-tac-cong-dan", "user/chuyen-muc-khac/tuong-tac-cong-dan.html", "user", "Tương tác công dân"),

        new("/giai-phap/giai-phap-an-toan-mang", "user/giai-phap/giai-phap-an-toan-mang.html", "user", "Giải pháp An toàn mạng"),
        new("/giai-phap/giai-phap-an-toan-thong-tin", "user/giai-phap/giai-phap-an-toan-thong-tin.html", "user", "Giải pháp An toàn thông tin")
    ];
}

static IReadOnlyList<NewsCategoryInfo> GetNewsCategories()
{
    return
    [
        new() { Slug = "cap-nhat-bao-lu", Title = "Cập nhật bão lũ" },
        new() { Slug = "cds-doi-moi-sang-tao", Title = "CĐS - Đổi mới sáng tạo" },
        new() { Slug = "chi-dao-dieu-hanh", Title = "Chỉ đạo điều hành" },
        new() { Slug = "cong-tac-xay-dung-dang", Title = "Công tác xây dựng Đảng" },
        new() { Slug = "giai-phap-an-toan-mang", Title = "Giải pháp An toàn mạng" },
        new() { Slug = "giai-phap-an-toan-thong-tin", Title = "Giải pháp An toàn thông tin" },
        new() { Slug = "thong-bao", Title = "Thông báo" },
        new() { Slug = "tieu-chuan-chat-luong", Title = "Tiêu chuẩn - Chất lượng" },
        new() { Slug = "tin-hoat-dong", Title = "Tin hoạt động" },
        new() { Slug = "trao-doi-kinh-nghiem", Title = "Trao đổi kinh nghiệm" },
        new() { Slug = "tuong-tac-cong-dan", Title = "Tương tác công dân" }
    ];
}

public sealed record FrontendRouteInfo(string Url, string FilePath, string Area, string Title);
