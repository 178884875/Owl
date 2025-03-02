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
    public async Task<UserDto> GetCurrentUserAsync()
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userContext.UserId);

        if (user == null)
        {
            throw new BusinessException("用户不存在");
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
}