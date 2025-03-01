using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntityFrameworkCore.Sqlite.Migrations
{
    /// <inheritdoc />
    public partial class AddChatMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SessionId = table.Column<long>(type: "INTEGER", nullable: true),
                    Role = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Content = table.Column<string>(type: "TEXT", maxLength: -1, nullable: false),
                    Files = table.Column<string>(type: "TEXT", nullable: false),
                    PromptTokens = table.Column<int>(type: "INTEGER", nullable: false),
                    CompleteTokens = table.Column<int>(type: "INTEGER", nullable: false),
                    ResponseTime = table.Column<int>(type: "INTEGER", nullable: false),
                    ShareId = table.Column<long>(type: "INTEGER", nullable: true),
                    ChannelId = table.Column<long>(type: "INTEGER", nullable: true),
                    ModelId = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessages");
        }
    }
}
