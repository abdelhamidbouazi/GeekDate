namespace sparkdates.Domain.Entities
{
    public class UserBlock : EntityBase
    {
        public Guid BlockingUserId { get; set; }
        public Guid BlockedUserId { get; set; }
    }
}
