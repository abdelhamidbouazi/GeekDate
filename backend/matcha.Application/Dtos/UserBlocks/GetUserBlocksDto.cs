namespace sparkdates.Application.Dtos.UserBlocks
{
    public class GetUserBlocksDto
    {
        public Guid BlockedUserId { get; set; }
        public Guid BlockingUserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string ProfilePicture { get; set; }
    }
}
