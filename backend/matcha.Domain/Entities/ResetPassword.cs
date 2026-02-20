namespace matcha.Domain.Entities
{
    public class ResetPassword : EntityBase
    {
        public Guid UserId { get; set; }
        public AppUser User { get; set; }
        public string Token { get; set; }
        public bool Expired { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
