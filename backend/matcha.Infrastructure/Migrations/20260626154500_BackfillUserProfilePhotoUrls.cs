using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sparkdates.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BackfillUserProfilePhotoUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE users
                SET PhotoProfileUrl = photos.Url
                FROM AppUsers AS users
                INNER JOIN Photos AS photos
                    ON photos.UserId = users.Id
                    AND photos.IsMain = 1
                WHERE users.PhotoProfileUrl IS NULL
                    OR LTRIM(RTRIM(users.PhotoProfileUrl)) = '';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
