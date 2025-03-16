namespace Owl.Chat.Host.Infrastructure;

public class Launch
{
    public static void Initialize()
    {
        DrawOwlLogo();
    }
    
    private static void DrawOwlLogo()
    {
        string[] owlLogo = new string[]
        {
            @"  /$$$$$$  /$$      /$$ /$$        ",
            @" /$$__  $$| $$  /$ | $$| $$        ",
            @"| $$  \ $$| $$ /$$$| $$| $$        ",
            @"| $$  | $$| $$/$$ $$ $$| $$        ",
            @"| $$  | $$| $$$$_  $$$$| $$        ",
            @"| $$  | $$| $$$/ \  $$$| $$        ",
            @"|  $$$$$$/| $$/   \  $$| $$$$$$$$",
            @" \______/ |__/     \__/|________/"
        };
        
        Console.ForegroundColor = ConsoleColor.Cyan;
        foreach (string line in owlLogo)
        {
            Console.WriteLine(line);
        }
        Console.ResetColor();
        Console.WriteLine();
    }
}