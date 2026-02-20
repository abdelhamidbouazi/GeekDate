namespace matcha.Domain.Entities
{
    public class UserTag : EntityBase
    {
        public Guid UserId { get; set; }
        public Guid TagId { get; set; }

        public AppUser User { get; set; }
        public Tag Tag { get; set; }

    }
}
