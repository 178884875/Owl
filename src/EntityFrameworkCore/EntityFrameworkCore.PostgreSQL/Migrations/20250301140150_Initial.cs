using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EntityFrameworkCore.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SessionId = table.Column<long>(type: "bigint", nullable: true),
                    Role = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Content = table.Column<string>(type: "text", maxLength: -1, nullable: false),
                    Files = table.Column<string>(type: "text", nullable: false),
                    PromptTokens = table.Column<int>(type: "integer", nullable: false),
                    CompleteTokens = table.Column<int>(type: "integer", nullable: false),
                    ResponseTime = table.Column<int>(type: "integer", nullable: false),
                    ShareId = table.Column<long>(type: "bigint", nullable: true),
                    ChannelId = table.Column<long>(type: "bigint", nullable: true),
                    ModelId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FileStorages",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Size = table.Column<int>(type: "integer", nullable: false),
                    ProviderId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileStorages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SessionId = table.Column<long>(type: "bigint", nullable: true),
                    Role = table.Column<string>(type: "text", nullable: false),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    ShareId = table.Column<long>(type: "bigint", nullable: true),
                    Error = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModelChannels",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Provider = table.Column<string>(type: "text", nullable: false),
                    Endpoint = table.Column<string>(type: "text", nullable: false),
                    ModelIds = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Avatar = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: false),
                    Favorite = table.Column<bool>(type: "boolean", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    ResponseTime = table.Column<long>(type: "bigint", nullable: true),
                    TokenCost = table.Column<long>(type: "bigint", nullable: true),
                    RequestCount = table.Column<long>(type: "bigint", nullable: true),
                    Available = table.Column<bool>(type: "boolean", nullable: false),
                    Keys = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelChannels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Models",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Provider = table.Column<string>(type: "text", nullable: false),
                    ModelId = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContextWindowTokens = table.Column<int>(type: "integer", nullable: true),
                    MaxOutput = table.Column<int>(type: "integer", nullable: true),
                    Pricing = table.Column<string>(type: "text", nullable: false),
                    ReleasedAt = table.Column<string>(type: "text", nullable: true),
                    Abilities = table.Column<string>(type: "text", nullable: false),
                    Resolutions = table.Column<string>(type: "text", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Models", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SessionGroups",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserOAuths",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProviderUserId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOAuths", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Avatar = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    UserName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: true),
                    Role = table.Column<string>(type: "text", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MessageFiles",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MessageId = table.Column<long>(type: "bigint", nullable: false),
                    FileId = table.Column<string>(type: "text", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileStorageId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageFiles_FileStorages_FileStorageId",
                        column: x => x.FileStorageId,
                        principalTable: "FileStorages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MessageFiles_Messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MessageModelUsages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SessionId = table.Column<long>(type: "bigint", nullable: true),
                    MessageId = table.Column<long>(type: "bigint", nullable: true),
                    PromptTokens = table.Column<int>(type: "integer", nullable: false),
                    CompleteTokens = table.Column<int>(type: "integer", nullable: false),
                    ResponseTime = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageModelUsages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageModelUsages_Messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MessageTexts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MessageId = table.Column<long>(type: "bigint", nullable: false),
                    ReasoningUpdate = table.Column<string>(type: "text", nullable: true),
                    Text = table.Column<string>(type: "text", nullable: false),
                    SearchResults = table.Column<string>(type: "text", nullable: false),
                    ExtraData = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageTexts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageTexts_Messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelChannelInviteCodes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChannelId = table.Column<long>(type: "bigint", nullable: false),
                    Code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ExpireTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsUsed = table.Column<bool>(type: "boolean", nullable: false),
                    UsedCount = table.Column<int>(type: "integer", nullable: false),
                    MaxUseCount = table.Column<int>(type: "integer", nullable: false),
                    UsedUsers = table.Column<string>(type: "text", nullable: false),
                    Inviter = table.Column<string>(type: "text", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelChannelInviteCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelChannelInviteCodes_ModelChannels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "ModelChannels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Avatar = table.Column<string>(type: "text", nullable: false),
                    Tags = table.Column<string>(type: "text", nullable: false),
                    Model = table.Column<string>(type: "text", nullable: false),
                    RenameModel = table.Column<string>(type: "text", nullable: false),
                    Temperature = table.Column<double>(type: "double precision", nullable: true),
                    MaxTokens = table.Column<int>(type: "integer", nullable: true),
                    TopP = table.Column<int>(type: "integer", nullable: true),
                    FrequencyPenalty = table.Column<int>(type: "integer", nullable: true),
                    PresencePenalty = table.Column<int>(type: "integer", nullable: true),
                    Favorite = table.Column<bool>(type: "boolean", nullable: false),
                    HistoryMessagesCount = table.Column<int>(type: "integer", nullable: false),
                    SessionGroupId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sessions_SessionGroups_SessionGroupId",
                        column: x => x.SessionGroupId,
                        principalTable: "SessionGroups",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ModelChannelShareUsers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChannelId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    TokenCount = table.Column<long>(type: "bigint", nullable: false),
                    RequestCount = table.Column<long>(type: "bigint", nullable: true),
                    ModelChannelId = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelChannelShareUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelChannelShareUsers_ModelChannels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "ModelChannels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModelChannelShareUsers_ModelChannels_ModelChannelId",
                        column: x => x.ModelChannelId,
                        principalTable: "ModelChannels",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ModelChannelShareUsers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ChannelId",
                table: "ChatMessages",
                column: "ChannelId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_CreatedBy",
                table: "ChatMessages",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ModelId",
                table: "ChatMessages",
                column: "ModelId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SessionId",
                table: "ChatMessages",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ShareId",
                table: "ChatMessages",
                column: "ShareId");

            migrationBuilder.CreateIndex(
                name: "IX_FileStorages_CreatedBy",
                table: "FileStorages",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FileStorages_ProviderId",
                table: "FileStorages",
                column: "ProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageFiles_CreatedBy",
                table: "MessageFiles",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MessageFiles_FileId",
                table: "MessageFiles",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageFiles_FileStorageId",
                table: "MessageFiles",
                column: "FileStorageId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageFiles_MessageId",
                table: "MessageFiles",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageModelUsages_CreatedBy",
                table: "MessageModelUsages",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MessageModelUsages_MessageId",
                table: "MessageModelUsages",
                column: "MessageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_CreatedBy",
                table: "Messages",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SessionId",
                table: "Messages",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ShareId",
                table: "Messages",
                column: "ShareId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageTexts_CreatedBy",
                table: "MessageTexts",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MessageTexts_MessageId",
                table: "MessageTexts",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannelInviteCodes_ChannelId_Code_Inviter",
                table: "ModelChannelInviteCodes",
                columns: new[] { "ChannelId", "Code", "Inviter" });

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannelInviteCodes_CreatedBy",
                table: "ModelChannelInviteCodes",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannels_CreatedBy",
                table: "ModelChannels",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannels_Name",
                table: "ModelChannels",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannels_Provider",
                table: "ModelChannels",
                column: "Provider");

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannelShareUsers_ChannelId",
                table: "ModelChannelShareUsers",
                column: "ChannelId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannelShareUsers_ChannelId_UserId",
                table: "ModelChannelShareUsers",
                columns: new[] { "ChannelId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannelShareUsers_CreatedBy",
                table: "ModelChannelShareUsers",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannelShareUsers_ModelChannelId",
                table: "ModelChannelShareUsers",
                column: "ModelChannelId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelChannelShareUsers_UserId",
                table: "ModelChannelShareUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Models_CreatedBy",
                table: "Models",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Models_DisplayName",
                table: "Models",
                column: "DisplayName");

            migrationBuilder.CreateIndex(
                name: "IX_Models_Provider",
                table: "Models",
                column: "Provider");

            migrationBuilder.CreateIndex(
                name: "IX_SessionGroups_CreatedBy",
                table: "SessionGroups",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_SessionGroups_Name",
                table: "SessionGroups",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_CreatedBy",
                table: "Sessions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_Name",
                table: "Sessions",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_SessionGroupId",
                table: "Sessions",
                column: "SessionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOAuths_CreatedBy",
                table: "UserOAuths",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_UserOAuths_Provider_ProviderUserId_UserId",
                table: "UserOAuths",
                columns: new[] { "Provider", "ProviderUserId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedBy",
                table: "Users",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Phone",
                table: "Users",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserName",
                table: "Users",
                column: "UserName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "MessageFiles");

            migrationBuilder.DropTable(
                name: "MessageModelUsages");

            migrationBuilder.DropTable(
                name: "MessageTexts");

            migrationBuilder.DropTable(
                name: "ModelChannelInviteCodes");

            migrationBuilder.DropTable(
                name: "ModelChannelShareUsers");

            migrationBuilder.DropTable(
                name: "Models");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropTable(
                name: "UserOAuths");

            migrationBuilder.DropTable(
                name: "FileStorages");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "ModelChannels");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "SessionGroups");
        }
    }
}
