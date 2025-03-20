using System.Text.RegularExpressions;
using FastService;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Owl.Chat.Host.Dto;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Services.User.Dto;
using Owl.Chat.Host.Services.User.Input;
using Owl.Chat.Core;
using Owl.Chat.Core.Dto;
using Owl.Chat.Core.Entities;

namespace Owl.Chat.Host.Services.User;

[Filter(typeof(ResultFilter))]
public class UserService(IDbContext dbContext, IMapper mapper, IUserContext userContext) : FastApi
{
    /// <summary>
    /// 通过账号获取用户信息
    /// </summary>
    /// <param name="account"></param>
    [IgnoreRoute]
    public async Task<UserDto> GetAsync(string account)
    {
        // 支持手机号邮箱，用户名
        var user = await dbContext.Users.FirstOrDefaultAsync(
            x => x.Phone == account || x.Email == account || x.UserName == account);

        if (user == null)
        {
            throw new BusinessException("用户不存在");
        }

        return mapper.Map<UserDto>(user);
    }

    /// <summary>
    /// 获取当前用户信息
    /// </summary>
    [Authorize]
    public async Task<UserDto> GetCurrentUserAsync()
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userContext.UserId);

        if (user == null)
        {
            throw new UnauthorizedAccessException();
        }

        user.PasswordHash = null;

        return mapper.Map<UserDto>(user);
    }


    /// <summary>
    /// Get a list of all users.
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task<PageDto<UserDto>> GetListAsync(string search, int page, int size)
    {
        var query = dbContext.Users.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(x => x.UserName.Contains(search) || x.DisplayName.Contains(search));
        }

        var total = await query.CountAsync();

        var users = await query
            .OrderBy(x => x.UserName)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        users.ForEach(x => x.PasswordHash = null);

        return new PageDto<UserDto>(total, mapper.Map<List<UserDto>>(users));
    }

    /// <summary>
    /// Create a new user.
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task<UserDto> CreateAsync(CreateUserDto createUserDto)
    {
        // 校验账号和密码是否为空
        if (string.IsNullOrEmpty(createUserDto.UserName) || string.IsNullOrEmpty(createUserDto.PasswordHash))
        {
            throw new BusinessException("用户名和密码不能为空");
        }

        // 校验角色是否为空
        if (string.IsNullOrEmpty(createUserDto.Role))
        {
            throw new BusinessException("角色不能为空");
        }

        // 校验角色是否合法
        if (createUserDto.Role != "Admin" && createUserDto.Role != "User")
        {
            throw new BusinessException("角色不合法");
        }

        // 校验邮箱格式
        if (!string.IsNullOrEmpty(createUserDto.Email) &&
            !Regex.IsMatch(createUserDto.Email, @"^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$"))
        {
            throw new BusinessException("邮箱格式不正确");
        }

        // 校验手机号格式
        if (!string.IsNullOrEmpty(createUserDto.Phone) && !Regex.IsMatch(createUserDto.Phone, @"^1[3456789]\d{9}$"))
        {
            throw new BusinessException("手机号格式不正确");
        }

        // 校验密码长度和复杂度至少六位
        if (createUserDto.PasswordHash.Length < 6 ||
            !Regex.IsMatch(createUserDto.PasswordHash, @"^(?=.*[0-9])(?=.*[a-zA-Z]).*$"))
        {
            throw new BusinessException("密码长度至少6位，且必须包含字母和数字");
        }

        // 校验用户名是否重复
        if (await dbContext.Users.AnyAsync(x => x.UserName == createUserDto.UserName))
        {
            throw new BusinessException("用户名已存在");
        }

        if (await dbContext.Users.AnyAsync(x => x.Email == createUserDto.Email))
        {
            throw new BusinessException("邮箱已存在");
        }

        if (await dbContext.Users.AnyAsync(x => x.Phone == createUserDto.Phone))
        {
            throw new BusinessException("手机号已存在");
        }

        // 如果头像为空，设置默认头像
        if (string.IsNullOrEmpty(createUserDto.Avatar))
        {
            createUserDto.Avatar = "/logo.png";
        }

        var newUser = mapper.Map<Owl.Chat.Core.Entities.User>(createUserDto);
        newUser.Enabled = true;
        newUser.PasswordHash = EncryptionHelper.Md5(newUser.PasswordHash);
        await dbContext.Users.AddAsync(newUser);
        await dbContext.UserPrompts.AddRangeAsync(UserPrompt.CreateDefault(newUser.Id));
        
        
        var items = await dbContext.Models.ToListAsync();
        
        await InitUserModelServiceAsync(userContext.UserId, items, dbContext);

        
        await dbContext.SaveChangesAsync();
        return mapper.Map<UserDto>(newUser);
    }

    /// <summary>
    /// Update an existing user.
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task<UserDto> UpdateAsync(UpdateUserDto updateUserDto)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == updateUserDto.Id);
        if (user == null)
        {
            throw new BusinessException("User does not exist");
        }

        // 校验账号和密码是否为空
        if (string.IsNullOrEmpty(updateUserDto.UserName) || string.IsNullOrEmpty(updateUserDto.PasswordHash))
        {
            throw new BusinessException("用户名和密码不能为空");
        }

        // 校验角色是否为空
        if (string.IsNullOrEmpty(updateUserDto.Role))
        {
            throw new BusinessException("角色不能为空");
        }

        // 校验角色是否合法
        if (updateUserDto.Role != "Admin" && updateUserDto.Role != "User")
        {
            throw new BusinessException("角色不合法");
        }

        // 校验邮箱格式
        if (!string.IsNullOrEmpty(updateUserDto.Email) &&
            !Regex.IsMatch(updateUserDto.Email, @"^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$"))
        {
            throw new BusinessException("邮箱格式不正确");
        }

        // 校验手机号格式
        if (!string.IsNullOrEmpty(updateUserDto.Phone) && !Regex.IsMatch(updateUserDto.Phone, @"^1[3456789]\d{9}$"))
        {
            throw new BusinessException("手机号格式不正确");
        }

        // 校验密码长度和复杂度至少六位,包含字母和数字
        if (updateUserDto.PasswordHash.Length < 6 ||
            !Regex.IsMatch(updateUserDto.PasswordHash, @"^(?=.*[0-9])(?=.*[a-zA-Z]).*$"))
        {
            throw new BusinessException("密码长度至少6位，且必须包含字母和数字");
        }

        // 校验用户名是否重复
        if (await dbContext.Users.AnyAsync(x => x.UserName == updateUserDto.UserName && x.Id != updateUserDto.Id))
        {
            throw new BusinessException("用户名已存在");
        }

        // 如果头像为空，设置默认头像
        if (string.IsNullOrEmpty(updateUserDto.Avatar))
        {
            updateUserDto.Avatar = "/logo.png";
        }

        mapper.Map(updateUserDto, user);
        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();
        return mapper.Map<UserDto>(user);
    }

    /// <summary>
    /// Delete a user.
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task DeleteAsync(string id)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            throw new BusinessException("User does not exist");
        }

        if (user.Role == "Admin")
        {
            throw new BusinessException("Cannot delete an admin user");
        }

        if (user.Id == userContext.UserId)
        {
            throw new BusinessException("Cannot delete the current user");
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// 启用/禁用用户
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task EnableAsync(string id, bool enable)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            throw new BusinessException("用户不存在");
        }

        // 不能禁用自己
        if (user.Id == userContext.UserId)
        {
            throw new BusinessException("不能禁用自己");
        }

        // 不能禁用管理员
        if (user.Role == "Admin")
        {
            throw new BusinessException("不能禁用管理员");
        }

        user.Enabled = enable;
        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// 重置密码
    /// </summary>
    [Authorize(Roles = "Admin")]
    public async Task ResetPasswordAsync(ResetPasswordInput input)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == input.Id);
        if (user == null)
        {
            throw new BusinessException("用户不存在");
        }

        // 不能重置自己的密码
        if (user.Id == userContext.UserId)
        {
            throw new BusinessException("不能重置自己的密码");
        }

        user.PasswordHash = EncryptionHelper.Md5(input.Password);
        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// 修改用户密码
    /// </summary>
    /// <returns></returns>
    [Authorize]
    public async Task ChangePasswordAsync(ChangePasswordInput input)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userContext.UserId);
        if (user == null)
        {
            throw new BusinessException("用户不存在");
        }

        if (user.PasswordHash != EncryptionHelper.Md5(input.OldPassword))
        {
            throw new BusinessException("原密码错误");
        }

        user.PasswordHash = EncryptionHelper.Md5(input.NewPassword);
        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();
    }

    [Authorize]
    public async Task<List<UserPrompt>> GetUserPromptsAsync()
    {
        var value = await dbContext.UserPrompts.Where(x => x.UserId == userContext.UserId).ToListAsync();

        value.ForEach(x => x.Prompt = string.Empty);

        return value;
    }

    [Authorize]
    public async Task CreateUserPromptAsync(CreateUserPromptInput input)
    {
        var userPrompt = new UserPrompt
        {
            UserId = userContext.UserId,
            Description = input.Description,
            Name = input.Name,
            Prompt = input.Prompt
        };
        await dbContext.UserPrompts.AddAsync(userPrompt);

        await dbContext.SaveChangesAsync();
    }

    [Authorize]
    public async Task DeleteUserPromptAsync(long id)
    {
        var userPrompt = await dbContext.UserPrompts.FirstOrDefaultAsync(x =>
            x.Id == id && x.UserId == userContext.UserId && x.IsDefault == false);
        if (userPrompt == null)
        {
            throw new BusinessException("用户提示不存在");
        }

        if (userPrompt.UserId != userContext.UserId)
        {
            throw new BusinessException("无权删除");
        }

        dbContext.UserPrompts.Remove(userPrompt);
        await dbContext.SaveChangesAsync();
    }

    [Authorize]
    public async Task UpdateUserPromptAsync(UpdateUserPromptInput input)
    {
        await dbContext.UserPrompts.Where(x => x.Id == input.Id && x.UserId == userContext.UserId)
            .ExecuteUpdateAsync(a => a.SetProperty(a => a.Name, input.Name)
                .SetProperty(a => a.Description, input.Description)
                .SetProperty(a => a.Prompt, input.Prompt));
    }

    /// <summary>
    /// 初始化用户模型服务
    /// </summary>
    [IgnoreRoute]
    public async Task InitUserModelServiceAsync(string userId, List<Model> items, IDbContext context,
        string? endpoint = null,
        string? key = null)
    {
        await CreateChannelAsync(context, "OpenAI", "OpenAI", "OpenAI", endpoint ?? "https://api.openai.com/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "OpenAI", true, ["OpenAI", "官方"], userId, key);

        // 创建DeepSeek
        await CreateChannelAsync(context, "DeepSeek", "DeepSeek", "DeepSeek", "https://api.deepseek.com/v1",
            items.Where(x => x.Enabled == true && x.Provider.Equals("DeepSeek", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "DeepSeek", true, ["DeepSeek"], userId);

        // 创建google,使用OpenAI兼容接口
        await CreateChannelAsync(context, "Google", "Google", "Google",
            "https://generativelanguage.googleapis.com/v1beta/openai/",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Google", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Google", false, ["Google"], userId);

        await CreateChannelAsync(context, "Anthropic", "Anthropic", "Anthropic", "https://api.anthropic.com/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Anthropic", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Anthropic", false, ["Anthropic"], userId);

        await CreateChannelAsync(context, "SiliconCloud", "SiliconCloud", "SiliconCloud",
            "https://api.siliconflow.cn/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("SiliconCloud", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "SiliconCloud", false, ["SiliconCloud"], userId);

        await CreateChannelAsync(context, "GiteeAI", "GiteeAI", "GiteeAI", "https://api.gitee.com/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("GiteeAI", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "GiteeAI", false, ["GiteeAI"], userId);

        await CreateChannelAsync(context, "Volcengine", "火山引擎", "Volcengine", "https://ark.cn-beijing.volces.com/api/v3",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Volcengine", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Volcengine", false, ["Volcengine"], userId);
        
        await CreateChannelAsync(context, "CoresHub", "基石智算", "CoresHub", "https://openapi.coreshub.cn/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("CoresHub", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "CoresHub", false, ["CoresHub"], userId);
        
        
        await CreateChannelAsync(context, "BaiduCloud", "百度云", "CoresHub", "https://qianfan.baidubce.com/v2",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("BaiduCloud", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "BaiduCloud", false, ["BaiduCloud"], userId);
        
        
        await CreateChannelAsync(context, "Github", "Github", "Github", "https://models.github.ai/inference",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Github", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Github", false, ["Github"], userId);

        
        await CreateChannelAsync(context, "Moonshot", "Moonshot", "Moonshot", "https://api.moonshot.cn/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Moonshot", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Moonshot", false, ["Moonshot"], userId);

        await CreateChannelAsync(context, "Nvidia", "Nvidia", "Nvidia", "https://integrate.api.nvidia.com/v1",
            items
                .Where(x => x.Enabled == true && x.Provider.Equals("Nvidia", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Id).ToList(), "Nvidia", false, ["Nvidia"], userId);

    }

    /// <summary>
    /// 创建渠道
    /// </summary>
    private static async Task CreateChannelAsync(IDbContext context, string name, string description, string avatar,
        string endpoint, List<string> modelIds, string provider, bool favorite, string[] tags, string userId,
        string? key = null)
    {
        var channel = new ModelChannel()
        {
            Name = name,
            Description = description,
            Avatar = avatar,
            Endpoint = endpoint,
            Enabled = false,
            ModelIds = modelIds,
            Provider = provider,
            Favorite = favorite,
            Available = true,
            Tags = tags,
            CreatedBy = userId,
        };

        if (!string.IsNullOrEmpty(key))
        {
            channel.Keys =
            [
                new()
                {
                    Key = key,
                    Description = "系统默认密钥",
                    Order = 999,
                }
            ];
        }

        await context.ModelChannels.AddAsync(channel);
    }
}