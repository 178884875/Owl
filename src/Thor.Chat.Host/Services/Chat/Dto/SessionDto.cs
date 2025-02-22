using Thor.Chat.Host.Dto;

namespace Thor.Chat.Host.Services.Chat.Dto;

public class SessionDto : EntityDto<long>
{
    /// <summary>
    /// 会话名称
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// 会话描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 会话图标
    /// </summary>
    public required string Avatar { get; set; }

    /// <summary>
    /// 会话标签
    /// </summary>
    public string[] Tags { get; set; } = [];

    /// <summary>
    /// 模型名称
    /// </summary>
    public required string Model { get; set; }

    /// <summary>
    /// 重命名模型
    /// </summary>
    public string? RenameModel { get; set; }
    
    /// <summary>
    /// 温度参数
    /// </summary>
    public double? Temperature { get; set; }

    /// <summary>
    /// 最大令牌数
    /// </summary>
    public int? MaxTokens { get; set; }

    /// <summary>
    /// Top P 参数
    /// </summary>
    public int? TopP { get; set; }

    /// <summary>
    /// 频率惩罚
    /// </summary>
    public int? FrequencyPenalty { get; set; }

    /// <summary>
    /// 存在惩罚
    /// </summary>
    public int? PresencePenalty { get; set; }

    /// <summary>
    /// 是否收藏
    /// </summary>
    public bool Favorite { get; set; }

    /// <summary>
    /// 会话组Id
    /// </summary>
    public string? SessionGroupId { get; set; }

    public string CreatedAtName
    {
        get
        {
            // 如果创建时间是今天，则显示小时分钟
            if (CreatedAt.Date == DateTime.Today)
            {
                return CreatedAt.ToString("HH:mm");
            }
            
            // 如果创建时间是昨天，则显示昨天：小时分钟
            if (CreatedAt.Date == DateTime.Today.AddDays(-1))
            {
                return $"昨天 {CreatedAt:HH:mm}";
            }
            
            // 如果创建时间是今年，则显示月日
            if (CreatedAt.Year == DateTime.Today.Year)
            {
                return CreatedAt.ToString("MM-dd");
            }
            
            // 否则显示年月日
            return CreatedAt.ToString("yyyy-MM-dd");
        }
    }

}