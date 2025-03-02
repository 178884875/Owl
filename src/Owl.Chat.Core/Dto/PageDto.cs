namespace Owl.Chat.Core.Dto;

public class PageDto<T>(int totalCount, List<T> data)
{
    /// <summary>
    /// 总记录数
    /// </summary>
    public int TotalCount { get; set; } = totalCount;

    /// <summary>
    /// 数据
    /// </summary>
    public List<T> Data { get; set; } = data;
}