namespace sparkdates.Application.Dtos.UserBlocks
{
    public class GetUsersBlocksDto
    {
        public IEnumerable<GetUserBlocksDto> UserBlocks { get; set; } = [];
    }
}
