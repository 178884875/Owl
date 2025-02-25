using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntityFrameworkCore.Sqlite.Migrations
{
    /// <inheritdoc />
    public partial class AddData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExtraData",
                table: "MessageTexts",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SearchResults",
                table: "MessageTexts",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExtraData",
                table: "MessageTexts");

            migrationBuilder.DropColumn(
                name: "SearchResults",
                table: "MessageTexts");
        }
    }
}
