using System.Security.Claims;
using System.Text.Json;
using .Chat.Core;

namespace Owl.Chat.Host.Infrastructure;

public class UserContext(IHttpContextAccessor httpContextAccessor) : IUserContext
{
    public string UserId
    {
        get
        {
            var userId = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Sid)?.Value;

            return userId ?? string.Empty;
        }
    }

    public T GetUser<T>()
    {
        var user = httpContextAccessor.HttpContext?.User.FindFirst("User")?.Value;

        if (user == null)
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(user);
    }

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

    public string Role
    {
        get
        {
            var role = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;

            return role ?? string.Empty;
        }
    }
}