using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Bật CORS để frontend có thể gọi API nếu chạy ở port khác
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
// Cung cấp các tệp tĩnh (hình ảnh tải lên) từ thư mục wwwroot
app.UseStaticFiles(); 

// Đảm bảo thư mục dữ liệu tồn tại
string dataDir = Path.Combine(builder.Environment.ContentRootPath, "data");
Directory.CreateDirectory(dataDir);
string configPath = Path.Combine(dataDir, "cau-hinh.json");
string newsPath = Path.Combine(dataDir, "tin-tuc.json");
string aboutPath = Path.Combine(dataDir, "chuc-nang-nhiem-vu.json");
string supportPath = Path.Combine(dataDir, "dau-moi-ho-tro.json");
string historyPath = Path.Combine(dataDir, "lich-su-hinh-thanh.json");
string productsPath = Path.Combine(dataDir, "san-pham-tieu-bieu.json");
string orgChartPath = Path.Combine(dataDir, "so-do-to-chuc.json");
string structPath = Path.Combine(dataDir, "co-cau-to-chuc.json");
string baoLuPath = Path.Combine(dataDir, "cap-nhat-bao-lu.json");
string usersPath = Path.Combine(dataDir, "nguoi-dung.json");
string commentsPath = Path.Combine(dataDir, "danh-sach-binh-luan.json");

// Đảm bảo các tệp dữ liệu mặc định tồn tại
if (!File.Exists(configPath)) File.WriteAllText(configPath, "{}");
if (!File.Exists(newsPath)) File.WriteAllText(newsPath, "[]");
if (!File.Exists(aboutPath)) File.WriteAllText(aboutPath, "{\"title\":\"\",\"content\":\"\"}");
if (!File.Exists(supportPath)) File.WriteAllText(supportPath, "{\"title\":\"\",\"content\":\"\"}");
if (!File.Exists(historyPath)) File.WriteAllText(historyPath, "{\"title\":\"\",\"content\":\"\"}");
if (!File.Exists(productsPath)) File.WriteAllText(productsPath, "{\"title\":\"\",\"content\":\"\"}");
if (!File.Exists(orgChartPath)) File.WriteAllText(orgChartPath, "{\"title\":\"\",\"content\":\"\"}");
if (!File.Exists(structPath)) File.WriteAllText(structPath, "{\"title\":\"\",\"content\":\"\"}");
if (!File.Exists(baoLuPath)) File.WriteAllText(baoLuPath, "{\"title\":\"\",\"content\":\"\"}");
if (!File.Exists(usersPath)) File.WriteAllText(usersPath, "[]");
if (!File.Exists(commentsPath)) File.WriteAllText(commentsPath, "[]");

// API: Lấy cấu hình
app.MapGet("/api/cau-hinh", async (HttpContext context) =>
{
    var configJson = await File.ReadAllTextAsync(configPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(configJson);
});

// API: Cập nhật cấu hình
app.MapPost("/api/cau-hinh", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(configPath, body);
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Cấu hình đã được lưu." });
});

// API: Lấy thông tin giới thiệu
app.MapGet("/api/chuc-nang-nhiem-vu", async (HttpContext context) =>
{
    var aboutJson = await File.ReadAllTextAsync(aboutPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(aboutJson);
});

// API: Cập nhật thông tin giới thiệu
app.MapPost("/api/chuc-nang-nhiem-vu", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(aboutPath, body);
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Trang giới thiệu đã được lưu." });
});

// API: Lấy thông tin hỗ trợ
app.MapGet("/api/dau-moi-ho-tro", async (HttpContext context) =>
{
    var supportJson = await File.ReadAllTextAsync(supportPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(supportJson);
});

// API: Cập nhật thông tin hỗ trợ
app.MapPost("/api/dau-moi-ho-tro", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(supportPath, body);
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Trang hỗ trợ đã được lưu." });
});

// API: Lấy lịch sử hình thành
app.MapGet("/api/lich-su-hinh-thanh", async (HttpContext context) =>
{
    var historyJson = await File.ReadAllTextAsync(historyPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(historyJson);
});

// API: Cập nhật lịch sử hình thành
app.MapPost("/api/lich-su-hinh-thanh", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(historyPath, body);
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Trang lịch sử đã được lưu." });
});

// API: Lấy sản phẩm tiêu biểu
app.MapGet("/api/san-pham-tieu-bieu", async (HttpContext context) =>
{
    var productsJson = await File.ReadAllTextAsync(productsPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(productsJson);
});

// API: Cập nhật sản phẩm tiêu biểu
app.MapPost("/api/san-pham-tieu-bieu", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(productsPath, body);
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Trang sản phẩm tiêu biểu đã được lưu." });
});

// API: Lấy sơ đồ tổ chức
app.MapGet("/api/so-do-to-chuc", async (HttpContext context) =>
{
    var orgChartJson = await File.ReadAllTextAsync(orgChartPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(orgChartJson);
});

// API: Cập nhật sơ đồ tổ chức
app.MapPost("/api/so-do-to-chuc", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(orgChartPath, body);
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Trang sơ đồ tổ chức đã được lưu." });
});

// API: Lấy cơ cấu tổ chức
app.MapGet("/api/co-cau-to-chuc", async (HttpContext context) =>
{
    var structJson = await File.ReadAllTextAsync(structPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(structJson);
});

// API: Cập nhật cơ cấu tổ chức
app.MapPost("/api/co-cau-to-chuc", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(structPath, body);
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Trang cơ cấu tổ chức đã được lưu." });
});

// API: Lấy thông tin bão lũ
app.MapGet("/api/cap-nhat-bao-lu", async (HttpContext context) =>
{
    var baoLuJson = await File.ReadAllTextAsync(baoLuPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(baoLuJson);
});

// API: Cập nhật thông tin bão lũ
app.MapPost("/api/cap-nhat-bao-lu", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(baoLuPath, body);
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Trang cập nhật bão lũ đã được lưu." });
});


// API: Lấy danh sách tin tức
app.MapGet("/api/tin-tuc", async (HttpContext context) =>
{
    var newsJson = await File.ReadAllTextAsync(newsPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(newsJson);
});

// API: Thêm tin tức mới
app.MapPost("/api/tin-tuc", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    
    // Phân tích danh sách tin tức hiện tại
    var newsJson = await File.ReadAllTextAsync(newsPath);
    var newsList = JsonSerializer.Deserialize<JsonElement[]>(newsJson) ?? Array.Empty<JsonElement>();
    
    // Tạo mảng mới với tin tức mới đưa lên đầu
    var newItem = JsonSerializer.Deserialize<JsonElement>(body);
    var updatedList = new JsonElement[newsList.Length + 1];
    updatedList[0] = newItem;
    Array.Copy(newsList, 0, updatedList, 1, newsList.Length);
    
    await File.WriteAllTextAsync(newsPath, JsonSerializer.Serialize(updatedList, new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đăng tin thành công." });
});

// API: Tải lên hình ảnh
app.MapPost("/api/upload", async (HttpContext context) =>
{
    if (!context.Request.HasFormContentType || !context.Request.Form.Files.Any())
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy file." });
        return;
    }

    var file = context.Request.Form.Files[0];
    var uploadsDir = Path.Combine(builder.Environment.WebRootPath, "uploads");
    Directory.CreateDirectory(uploadsDir);

    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
    var filePath = Path.Combine(uploadsDir, fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    var fileUrl = $"/uploads/{fileName}";
    await context.Response.WriteAsJsonAsync(new { success = true, url = fileUrl });
});


// --- API NGƯỜI DÙNG & XÁC THỰC ---
app.MapGet("/api/nguoi-dung", async (HttpContext context) =>
{
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    // Ẩn mật khẩu để đảm bảo an toàn trước khi trả về
    var safeList = usersList.Select(u => new { u.Id, u.Username, u.FullName, u.Email, u.DateOfBirth, u.AvatarUrl, u.RegisterDate, u.IsActive }).ToList();
    await context.Response.WriteAsJsonAsync(safeList);
});

app.MapGet("/api/nguoi-dung/{username}", async (HttpContext context, string username) =>
{
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    var user = usersList.FirstOrDefault(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
    

    if (user == null) {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy người dùng." });
        return;
    }
    
    // Không trả về mật khẩu
    await context.Response.WriteAsJsonAsync(new { 
        success = true, 
        user = new { 
            user.Username, 
            user.RegisterDate, 
            user.Email, 
            user.DateOfBirth, 
            user.AvatarUrl, 
            user.FullName,
            user.IsActive
        } 
    });
});

app.MapPut("/api/nguoi-dung/{username}", async (HttpContext context, string username) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var updateReq = JsonSerializer.Deserialize<User>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    var userIndex = usersList.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
    if (userIndex == -1) {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy người dùng." });
        return;
    }
    
    var user = usersList[userIndex];
    
    // Xác minh mật khẩu cũ nếu muốn đổi mật khẩu
    if (!string.IsNullOrEmpty(updateReq.Password)) {
        // Ở đây chúng ta tạm thời cập nhật mật khẩu trực tiếp cho đơn giản.
        // Trong ứng dụng thực tế cần xác minh mật khẩu cũ.
        user.Password = updateReq.Password;
    }
    
    if (updateReq.Email != null) user.Email = updateReq.Email;
    if (updateReq.DateOfBirth != null) user.DateOfBirth = updateReq.DateOfBirth;
    if (updateReq.AvatarUrl != null) user.AvatarUrl = updateReq.AvatarUrl;
    if (updateReq.FullName != null) user.FullName = updateReq.FullName;
    
    usersList[userIndex] = user;
    
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Cập nhật thành công.", user = new { user.Username, user.Email, user.DateOfBirth, user.AvatarUrl, user.FullName } });
});

app.MapPost("/api/register", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var newUser = JsonSerializer.Deserialize<User>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    if (usersList.Any(u => u.Username == newUser.Username)) {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Tên đăng nhập đã tồn tại." });
        return;
    }
    
    newUser.Id = Guid.NewGuid().ToString();
    newUser.RegisterDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    usersList.Add(newUser);
    
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đăng ký thành công.", user = new { newUser.Username, newUser.FullName } });
});

app.MapPost("/api/login", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var loginReq = JsonSerializer.Deserialize<User>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    var user = usersList.FirstOrDefault(u => u.Username == loginReq.Username && u.Password == loginReq.Password);
    if (user == null) {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Sai tên đăng nhập hoặc mật khẩu." });
        return;
    }
    
    if (!user.IsActive) {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Tài khoản của bạn đã bị khóa." });
        return;
    }
    
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đăng nhập thành công.", user = new { user.Username, user.FullName } });
});

// --- API BÌNH LUẬN ---
app.MapGet("/api/binh-luan", async (HttpContext context, string pageId) =>
{
    var commentsJson = await File.ReadAllTextAsync(commentsPath);
    var commentsList = JsonSerializer.Deserialize<List<Comment>>(commentsJson) ?? new List<Comment>();
    
    var pageComments = commentsList.Where(c => c.PageId == pageId).ToList();
    
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(JsonSerializer.Serialize(pageComments));
});

app.MapPost("/api/binh-luan", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var newComment = JsonSerializer.Deserialize<Comment>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var commentsJson = await File.ReadAllTextAsync(commentsPath);
    var commentsList = JsonSerializer.Deserialize<List<Comment>>(commentsJson) ?? new List<Comment>();
    
    newComment.Id = Guid.NewGuid().ToString();
    newComment.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    newComment.Likes = 0;
    newComment.Dislikes = 0;
    
    // Find AvatarUrl
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson) ?? new List<User>();
    var user = usersList.FirstOrDefault(u => u.Username == newComment.Username);
    newComment.AvatarUrl = user?.AvatarUrl ?? "";
    
    commentsList.Add(newComment);
    
    await File.WriteAllTextAsync(commentsPath, JsonSerializer.Serialize(commentsList, new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đã gửi bình luận.", comment = newComment });
});

app.MapPost("/api/binh-luan/{id}/like", async (HttpContext context, string id) =>
{
    var commentsJson = await File.ReadAllTextAsync(commentsPath);
    var commentsList = JsonSerializer.Deserialize<List<Comment>>(commentsJson) ?? new List<Comment>();
    
    var comment = commentsList.FirstOrDefault(c => c.Id == id);
    if (comment != null) {
        comment.Likes += 1;
        await File.WriteAllTextAsync(commentsPath, JsonSerializer.Serialize(commentsList, new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        await context.Response.WriteAsJsonAsync(new { success = true, likes = comment.Likes });
    } else {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy bình luận." });
    }
});

app.MapPost("/api/binh-luan/{id}/dislike", async (HttpContext context, string id) =>
{
    var commentsJson = await File.ReadAllTextAsync(commentsPath);
    var commentsList = JsonSerializer.Deserialize<List<Comment>>(commentsJson) ?? new List<Comment>();
    
    var comment = commentsList.FirstOrDefault(c => c.Id == id);
    if (comment != null) {
        comment.Dislikes += 1;
        await File.WriteAllTextAsync(commentsPath, JsonSerializer.Serialize(commentsList, new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        await context.Response.WriteAsJsonAsync(new { success = true, dislikes = comment.Dislikes });
    } else {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy bình luận." });
    }
});


// --- API QUẢN TRỊ VIÊN ---
app.MapPost("/api/admin/nguoi-dung", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var newUser = JsonSerializer.Deserialize<User>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    if (usersList.Any(u => string.Equals(u.Username, newUser.Username, StringComparison.OrdinalIgnoreCase))) {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Tên đăng nhập đã tồn tại." });
        return;
    }
    
    newUser.Id = Guid.NewGuid().ToString();
    newUser.RegisterDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    if (string.IsNullOrEmpty(newUser.Password)) newUser.Password = "123456"; // mật khẩu mặc định
    usersList.Add(newUser);
    
    var jsonOptions = new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, jsonOptions));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Thêm tài khoản thành công." });
});

app.MapPut("/api/admin/nguoi-dung/{username}", async (HttpContext context, string username) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var updateReq = JsonSerializer.Deserialize<User>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    var userIndex = usersList.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
    if (userIndex == -1) {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy người dùng." });
        return;
    }
    
    var user = usersList[userIndex];
    if (!string.IsNullOrEmpty(updateReq.Password)) user.Password = updateReq.Password;
    if (updateReq.FullName != null) user.FullName = updateReq.FullName;
    if (updateReq.Email != null) user.Email = updateReq.Email;
    user.IsActive = updateReq.IsActive; // Luôn cập nhật trạng thái hoạt động dựa trên yêu cầu của admin
    
    usersList[userIndex] = user;
    
    var jsonOptions = new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, jsonOptions));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Cập nhật tài khoản thành công." });
});

app.MapDelete("/api/admin/nguoi-dung/{username}", async (HttpContext context, string username) =>
{
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    var userIndex = usersList.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
    if (userIndex == -1) {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy người dùng." });
        return;
    }
    
    // Ngăn việc xóa tài khoản admin gốc
    if (username.ToLower() == "admin") {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không thể xóa tài khoản admin gốc." });
        return;
    }
    
    usersList.RemoveAt(userIndex);
    
    var jsonOptions = new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, jsonOptions));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đã xóa tài khoản." });
});

app.Run();

public class User {
    public string Id { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string RegisterDate { get; set; }
    public string Email { get; set; }
    public string DateOfBirth { get; set; }
    public string AvatarUrl { get; set; }
    public string FullName { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Comment {
    public string Id { get; set; }
    public string PageId { get; set; }
    public string Username { get; set; }
    public string Content { get; set; }
    public int Likes { get; set; }
    public int Dislikes { get; set; }
    public string AvatarUrl { get; set; }
    public string CreatedAt { get; set; }
}

