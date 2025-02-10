using System.Text;
using EntityFrameworkCore.Sqlite.Extensions;
using Mapster;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Thor.Chat.Host.Infrastructure;
using Thor.Chat.Host.Options;

namespace Thor.Chat.Host.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddJwt(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();

        services.AddScoped<IUserContext, UserContext>();

        var option = configuration.GetSection(JwtOptions.Name);

        var jwtOption = option.Get<JwtOptions>();

        services.Configure<JwtOptions>(option);
        
        services.Configure<ChatSessionOptions>(configuration.GetSection(ChatSessionOptions.Session));

        services.AddAuthorization()
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOption!.Issuer,
                    ValidAudience = jwtOption.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOption.Secret))
                };
            });

        services.WithFast();

        services.AddMapster();

        services.AddSingleton<JwtHelper>();

        services.AddCaptcha();
        
        return services;
    }

    public static IServiceCollection AddDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var type = configuration.GetConnectionString("Type");

        if (string.IsNullOrEmpty(type))
        {
            throw new ArgumentNullException("Type");
        }

        if (type.Equals("sqlite", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSqliteDbContext(configuration);
        }

        return services;
    }

    public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddJwt(configuration);

        services.AddDbContext(configuration);

        return services;
    }

    public static WebApplication MapMiniApis(this WebApplication app)
    {
        app.MapFast();

        return app;
    }
}