namespace matcha.Application.Dtos.UserLikes
{
    public class UserLikesDto
    {
        public Guid LikedUserId { get; set; }
        public Guid LikerUserId { get; set; }
    }
}
