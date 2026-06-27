namespace sparkdates.Application.Dtos.UserLikes
{
    public class GetUserLikesDto
    {
        public Guid LikedUserId { get; set; }
        public Guid LikerUserId { get; set; }
    }
}
