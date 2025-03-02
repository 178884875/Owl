using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Owl.Chat.Host.Options;

namespace Owl.Chat.Host.Infrastructure;

public class JwtHelper(IOptions<JwtOptions> options)
{
    public string CreateToken(Dictionary<string, string> dist, string userId, string[] roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Role, string.Join(',', roles)),
            new(ClaimTypes.Sid, userId)
        };
        claims.AddRange(dist.Select(item => new Claim(item.Key, item.Value)));

        var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Value.Secret));

        var algorithm = SecurityAlgorithms.HmacSha256;

        var signingCredentials = new SigningCredentials(secretKey, algorithm);

        var jwtSecurityToken = new JwtSecurityToken(
            options.Value.Issuer, //Issuer
            options.Value.Audience, //Audience
            claims, //Claims,
            DateTime.Now, //notBefore
            DateTime.Now.AddDays(options.Value.ExpireDay), //expires
            signingCredentials //Credentials
        );

        // 6. 将token变为string
        var token = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);

        return token;
    }
}