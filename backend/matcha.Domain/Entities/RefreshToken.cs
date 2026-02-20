namespace matcha.Domain.Entities
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        public string Token { get; set; }
        public Guid UserId { get; set; }
        public DateTime ExpriesOnUtc { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastUsedUtc { get; set; }
        public string IpAddress { get; set; }
        public AppUser User { get; set; }

    }
}
