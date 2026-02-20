namespace matcha.Application.Dtos.UserBlocks
{
    public class GetUserBlocksDto
    {
        public Guid BlockedUserId { get; set; }
        public Guid BlockingUserId { get; set; }
    }
}
