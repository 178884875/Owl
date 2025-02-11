using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Infrastructure;

public interface IUserContext
{
    string UserId { get; }

    UserDto? User { get; }

    bool IsAuthenticated { get; }

    public string Role { get; }
}