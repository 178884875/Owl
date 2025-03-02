namespace Owl.Chat.Host.Infrastructure;

public class NotSufficientFundsException(string message) : Exception(message)
{
}