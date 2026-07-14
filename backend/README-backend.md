# Backend IOC Daklak

## Chạy SQL patch một lần

Chạy file `database/001_post_schema_patch.sql` bằng tài khoản có quyền DDL, ví dụ `sa`.

Patch này dùng để:

- Nới `Portal.SystemConfigs.ConfigValue` sang `NVARCHAR(MAX)`.
- Thêm `Cms.Articles.LegacyId` để có chỗ giữ mã bài viết cũ nếu cần.

## Chạy API

```powershell
dotnet restore backend\Backend.csproj
dotnet run --project backend\Backend.csproj --launch-profile Backend
```

API chạy tại:

```text
http://localhost:5000/api
```

Frontend cũng được backend phục vụ trực tiếp từ các thư mục `admin`, `auth`, `profile`, `user`, `shared`:

```text
http://localhost:5000/
http://localhost:5000/admin
http://localhost:5000/profile
http://localhost:5000/tin-tuc/cap-nhat-bao-lu
```

Xem danh sách URL đã cấu hình:

```text
http://localhost:5000/api/site-map
```

## Chọn nguồn dữ liệu

Trong `appsettings.json`:

```json
"DataProvider": "SqlServer"
```

Đổi về `"Json"` nếu cần chạy nhanh bằng dữ liệu trong `backend/data`.

## Migrate JSON sang SQL Server

Sau khi API chạy bằng `SqlServer`, gọi:

```powershell
Invoke-RestMethod -Method Post http://localhost:5000/api/admin/migrate-json
```

Endpoint này đọc dữ liệu từ `backend/data` và ghi sang các bảng SQL tương ứng.

## Xác thực JWT

`/api/login` và `/api/register` vẫn trả `user` để frontend cũ không bị vỡ, đồng thời trả thêm:

```json
{
  "accessToken": "...",
  "tokenType": "Bearer",
  "expiresAt": "yyyy-MM-dd HH:mm:ss"
}
```

Kiểm tra token:

```powershell
$login = Invoke-RestMethod -Method Post http://localhost:5000/api/login -ContentType 'application/json' -Body '{"username":"admin","password":"admin123"}'
$headers = @{ Authorization = "$($login.tokenType) $($login.accessToken)" }
Invoke-RestMethod http://localhost:5000/api/auth/me -Headers $headers
```
