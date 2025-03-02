namespace Owl.Chat.Host.Infrastructure;

public class EncryptionHelper
{
    /// <summary>
    /// md5加密
    /// </summary>
    /// <param name="input"></param>
    /// <returns></returns>
    public static string Md5(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
        var hashBytes = md5.ComputeHash(inputBytes);
        var sb = new System.Text.StringBuilder();
        foreach (var t in hashBytes)
        {
            sb.Append(t.ToString("X2"));
        }
        return sb.ToString();
    }
}