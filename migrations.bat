@echo off
set MIGRATION_NAME=Initial

set ConnectionStrings:Type=postgresql 
dotnet ef migrations add --project src\EntityFrameworkCore\EntityFrameworkCore.PostgreSQL\EntityFrameworkCore.PostgreSQL.csproj --startup-project src\Thor.Chat.Host\Thor.Chat.Host.csproj --context EntityFrameworkCore.PostgreSQL.PostgreSQLDbContext --configuration Debug --verbose %MIGRATION_NAME% --output-dir Migrations\

set ConnectionStrings:Type=sqlserver
dotnet ef migrations add --project src\EntityFrameworkCore\EntityFrameworkCore.SqlServer\EntityFrameworkCore.SqlServer.csproj --startup-project src\Thor.Chat.Host\Thor.Chat.Host.csproj --context EntityFrameworkCore.SqlServer.SqlServerDbContext --configuration Debug --verbose %MIGRATION_NAME% --output-dir Migrations\

set ConnectionStrings:Type=sqlite
dotnet ef migrations add --project src\EntityFrameworkCore\EntityFrameworkCore.Sqlite\EntityFrameworkCore.Sqlite.csproj --startup-project src\Thor.Chat.Host\Thor.Chat.Host.csproj --context EntityFrameworkCore.Sqlite.SqliteDbContext --configuration Debug --verbose %MIGRATION_NAME% --output-dir Migrations\

set ConnectionStrings:Type=mysql
dotnet ef migrations add --project src\EntityFrameworkCore\EntityFrameworkCore.MySql\EntityFrameworkCore.MySql.csproj --startup-project src\Thor.Chat.Host\Thor.Chat.Host.csproj --context EntityFrameworkCore.MySql.MySqlDbContext --configuration Debug --verbose %MIGRATION_NAME% --output-dir Migrations\

set ConnectionStrings:Type=dm
dotnet ef migrations add --project src\EntityFrameworkCore\EntityFrameworkCore.DaMeng\EntityFrameworkCore.DaMeng.csproj --startup-project src\Thor.Chat.Host\Thor.Chat.Host.csproj --context EntityFrameworkCore.DaMeng.DaMengDbContext --configuration Debug --verbose %MIGRATION_NAME% --output-dir Migrations\

