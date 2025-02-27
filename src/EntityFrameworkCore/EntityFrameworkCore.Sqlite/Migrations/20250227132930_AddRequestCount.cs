using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntityFrameworkCore.Sqlite.Migrations
{
    /// <inheritdoc />
    public partial class AddRequestCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "RequestCount",
                table: "ModelChannelShareUsers",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "TokenCount",
                table: "ModelChannelShareUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequestCount",
                table: "ModelChannelShareUsers");

            migrationBuilder.DropColumn(
                name: "TokenCount",
                table: "ModelChannelShareUsers");
        }
    }
}
