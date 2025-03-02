namespace Owl.Chat.Host.Services.User.Input;

public class ChangePasswordInput
{
    public string OldPassword { get; set; }
    
    public string NewPassword { get; set; }
}