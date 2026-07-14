using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public sealed class AuthTokenService
{
    private readonly JwtOptions _options;

    public AuthTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public AuthResponseDto CreateAuthResponse(UserDto user, string message)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_options.ExpiresMinutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var role = ResolveRole(user.Username);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id ?? user.Username ?? string.Empty),
            new(JwtRegisteredClaimNames.UniqueName, user.Username ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
            new(ClaimTypes.Name, user.Username ?? string.Empty),
            new(ClaimTypes.Role, role)
        };

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            claims.Add(new Claim(ClaimTypes.Email, user.Email));
        }

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        return new AuthResponseDto
        {
            Success = true,
            Message = message,
            User = user,
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture)
        };
    }

    public static string ResolveRole(string? username)
    {
        // Tạm thời suy luận quyền admin từ tài khoản seed hiện có; phase sau có thể tách thành cột Role riêng trong DB.
        return !string.IsNullOrWhiteSpace(username) && username.StartsWith("admin", StringComparison.OrdinalIgnoreCase)
            ? "Admin"
            : "User";
    }
}
