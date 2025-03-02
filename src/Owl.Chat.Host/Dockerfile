FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/.Chat.Host/.Chat.Host.csproj", "src/.Chat.Host/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.Sqlite/EntityFrameworkCore.Sqlite.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.Sqlite/"]
COPY ["src/Owl.Chat.Core/Owl.Chat.Core.csproj", "src/Owl.Chat.Core/"]
COPY ["src/Storage/Storage.Core/Storage.Core.csproj", "src/Storage/Storage.Core/"]
COPY ["src/Storage/Storage.LiteDB/Storage.LiteDB.csproj", "src/Storage/Storage.LiteDB/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.PostgreSQL/EntityFrameworkCore.PostgreSQL.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.PostgreSQL/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.SqlServer/EntityFrameworkCore.SqlServer.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.SqlServer/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.MySql/EntityFrameworkCore.MySql.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.MySql/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.DaMeng/EntityFrameworkCore.DaMeng.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.DaMeng/"]
RUN dotnet restore "src/.Chat.Host/.Chat.Host.csproj"
COPY . .
WORKDIR "/src/src/.Chat.Host"
RUN dotnet build ".Chat.Host.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish ".Chat.Host.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", ".Chat.Host.dll"]
