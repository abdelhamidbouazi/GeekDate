namespace matcha.Application.Dtos.UserLikes
{
    public class CreateUserLikesDto
    {
        public Guid LikedUserId { get; set; }
        public Guid LikerUserId { get; set; }
    }
}
