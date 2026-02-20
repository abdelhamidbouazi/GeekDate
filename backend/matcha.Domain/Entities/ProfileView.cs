namespace matcha.Domain.Entities
{
    public class ProfileView : EntityBase
    {
        public DateTime ViewedAt { get; set; }
        public Guid FromUserId { get; set; }
        public Guid TargetUserId { get; set; }
    }
}
