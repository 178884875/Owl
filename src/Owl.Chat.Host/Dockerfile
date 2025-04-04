FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER root
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo "Asia/Shanghai" > /etc/timezone
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM node:20.18-alpine3.21 as web
WORKDIR /src
COPY web .
RUN yarn
RUN npm i
RUN yarn run build


FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/Owl.Chat.Host/Owl.Chat.Host.csproj", "src/Owl.Chat.Host/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.DaMeng/EntityFrameworkCore.DaMeng.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.DaMeng/"]
COPY ["src/Owl.Chat.Core/Owl.Chat.Core.csproj", "src/Owl.Chat.Core/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.MySql/EntityFrameworkCore.MySql.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.MySql/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.PostgreSQL/EntityFrameworkCore.PostgreSQL.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.PostgreSQL/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.Sqlite/EntityFrameworkCore.Sqlite.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.Sqlite/"]
COPY ["src/EntityFrameworkCore/EntityFrameworkCore.SqlServer/EntityFrameworkCore.SqlServer.csproj", "src/EntityFrameworkCore/EntityFrameworkCore.SqlServer/"]
COPY ["src/Storage/Storage.Core/Storage.Core.csproj", "src/Storage/Storage.Core/"]
COPY ["src/Storage/Storage.LiteDB/Storage.LiteDB.csproj", "src/Storage/Storage.LiteDB/"]
RUN dotnet restore "src/Owl.Chat.Host/Owl.Chat.Host.csproj"
COPY . .
WORKDIR "/src/src/Owl.Chat.Host"
RUN dotnet build "Owl.Chat.Host.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Owl.Chat.Host.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=web /src/dist ./wwwroot
ENTRYPOINT ["dotnet", "Owl.Chat.Host.dll"]
