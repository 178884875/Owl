namespace Thor.Chat.Core;

public interface IUserContext
{
    string UserId { get; }

    T GetUser<T>();

    bool IsAuthenticated { get; }

    public string Role { get; }
}