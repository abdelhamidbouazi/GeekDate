namespace matcha.Application.Dtos.UserLikes
{
    public class GetUsersLikesDto
    {
        public Guid LikedUserId { get; set; }
        public Guid LikerUserId { get; set; }
    }
}
