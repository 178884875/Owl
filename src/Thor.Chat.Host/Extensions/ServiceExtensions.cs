using System.Text;
using DocumentConverter;
using EntityFrameworkCore.DaMeng.Extensions;
using EntityFrameworkCore.MySql.Extensions;
using EntityFrameworkCore.PostgreSQL.Extensions;
using EntityFrameworkCore.Sqlite.Extensions;
using EntityFrameworkCore.SqlServer.Extensions;
using Mapster;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Storage.LiteDB.Extensions;
using Thor.Chat.Core;
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

        services.Configure<ChatSessionOptions>(configuration.GetSection(ChatSessionOptions.Name));

        services.Configure<ChatOptions>(configuration.GetSection(ChatOptions.Name));

        services.Configure<GoogelOption>(configuration.GetSection(GoogelOption.Name));

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
        else if (type.Equals("postgresql", StringComparison.OrdinalIgnoreCase))
        {
            services.AddPostgreSQLDbContext(configuration);
        }
        else if (type.Equals("sqlserver", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSqlServerDbContext(configuration);
        }
        else if (type.Equals("mysql", StringComparison.OrdinalIgnoreCase))
        {
            services.AddMySqlDbContext(configuration);
        }
        else if (type.Equals("dm", StringComparison.OrdinalIgnoreCase))
        {
            services.AddDaMengDbContext(configuration);
        }

        return services;
    }

    public static IServiceCollection AddStorage(this IServiceCollection services, IConfiguration configuration)
    {
        if (configuration["Storage:Type"].Equals("LiteDB", StringComparison.OrdinalIgnoreCase))
        {
            services.AddLiteDb();
        }

        return services;
    }

    public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddJwt(configuration);

        services.AddDbContext(configuration);

        services.AddStorage(configuration);

        services.AddSingleton<BingScraper>();

        services.AddSingleton<DocumentToMarkdown>((provider =>
        {
            var env = provider.GetRequiredService<IWebHostEnvironment>();
            var chatOptions = provider.GetRequiredService<IOptions<ChatOptions>>().Value;

            return new DocumentToMarkdown(chatOptions, Path.Combine(env.WebRootPath, "images"));
        }));

        return services;
    }

    public static WebApplication MapMiniApis(this WebApplication app)
    {
        app.MapFast();

        return app;
    }
}