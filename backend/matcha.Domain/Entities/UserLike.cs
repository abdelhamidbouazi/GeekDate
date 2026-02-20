namespace matcha.Domain.Entities
{
    public class UserLike : EntityBase
    {
        public Guid LikerUserId { get; set; }
        public Guid LikedUserId { get; set; }
        public DateTime LikedAt { get; set; }
        public DateTime? MatchedAt { get; set; }
        public bool IsMatched { get; set; } = false;
    }
}
