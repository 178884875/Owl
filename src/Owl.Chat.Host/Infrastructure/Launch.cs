namespace Owl.Chat.Host.Infrastructure;

public class Launch
{
    private const string Owl =
        """
                   /$$$$$$    /$$      /$$   /$$        
                  /$$__  $$  | $$  /$ | $$  | $$       
                 | $$  \ $$  | $$ /$$$| $$  | $$        
                 | $$  | $$  | $$/$$ $$ $$  | $$ 
                 | $$  | $$  | $$$$_  $$$$  | $$ 
                 | $$  | $$  | $$$/ \  $$$  | $$ 
                 |  $$$$$$/  | $$/   \  $$  | $$$$$$$$
                 \______/    |__/     \__/  |________/
        """;

    public static void Initialize()
    {
        DrawOwlLogo();
    }

    private static void DrawOwlLogo()
    {
        var version = typeof(Launch).Assembly.GetName().Version;
        Console.WriteLine($"{DateTime.Now:yyyy:MM:dd hh:mm:ss} Owl.Chat {version?.ToString()} :) 开始启动...");

        Console.WriteLine();
        Console.WriteLine();

        Console.ForegroundColor = ConsoleColor.DarkGreen;
        Console.WriteLine(Owl);

        Console.ResetColor();
        Console.WriteLine();
    }
}