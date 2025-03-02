namespace Owl.Chat.Host.Dto;

public class ResultDto
{
    public bool Success { get; set; }

    public string? Message { get; set; }

    public object? Data { get; set; }
    
    public static ResultDto SuccessResult(object? data = null)
    {
        return new ResultDto
        {
            Success = true,
            Data = data
        };
    }
    
    public static ResultDto FailResult(string message)
    {
        return new ResultDto
        {
            Success = false,
            Message = message
        };
    }
}