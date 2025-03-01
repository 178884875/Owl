using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntityFrameworkCore.DaMeng.Migrations
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
                    Id = table.Column<long>(type: "BIGINT", nullable: false)
                        .Annotation("Dm:Identity", "1, 1"),
                    SessionId = table.Column<long>(type: "BIGINT", nullable: true),
                    Role = table.Column<string>(type: "NVARCHAR2(255)", maxLength: 255, nullable: false),
                    Content = table.Column<string>(type: "NVARCHAR2(max)", maxLength: -1, nullable: false),
                    Files = table.Column<string>(type: "NVARCHAR2(32767)", nullable: false),
                    PromptTokens = table.Column<int>(type: "INT", nullable: false),
                    CompleteTokens = table.Column<int>(type: "INT", nullable: false),
                    ResponseTime = table.Column<int>(type: "INT", nullable: false),
                    ShareId = table.Column<long>(type: "BIGINT", nullable: true),
                    ChannelId = table.Column<long>(type: "BIGINT", nullable: true),
                    ModelId = table.Column<string>(type: "NVARCHAR2(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false),
                    CreatedBy = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: true)
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
