namespace sparkdates.Domain.Entities
{
    public class ConfirmEmailToken : EntityBase
    {
        public string Token { get; set; }
        public Guid UserId { get; set; }
        public AppUser User { get; set; }
        public bool Expired { get; set; }
        public DateTime ExpiredAt { get; set; }
    }
}
