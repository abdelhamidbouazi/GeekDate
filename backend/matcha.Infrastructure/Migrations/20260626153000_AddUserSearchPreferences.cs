using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sparkdates.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSearchPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserSearchPreferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MinAge = table.Column<int>(type: "int", nullable: false),
                    MaxAge = table.Column<int>(type: "int", nullable: false),
                    MinFameRating = table.Column<int>(type: "int", nullable: false),
                    MaxFameRating = table.Column<int>(type: "int", nullable: false),
                    MaxDistanceKm = table.Column<double>(type: "float", nullable: true),
                    InterestIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSearchPreferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSearchPreferences_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserSearchPreferences_UserId",
                table: "UserSearchPreferences",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSearchPreferences");
        }
    }
}
