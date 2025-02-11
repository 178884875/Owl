using FastService;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Thor.Chat.Core;
using Thor.Chat.Host.Dto;
using Thor.Chat.Host.Infrastructure;

namespace Thor.Chat.Host.Services.User;

public class UserService(IDbContext dbContext, IMapper mapper) : FastApi
{
    /// <summary>
    /// 通过账号获取用户信息
    /// </summary>
    /// <param name="account"></param>
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
}