using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntityFrameworkCore.SqlServer.Migrations
{
    /// <inheritdoc />
    public partial class AddSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "System",
                table: "Sessions",
                type: "nvarchar(max)",
                maxLength: -1,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "System",
                table: "Sessions");
        }
    }
}
