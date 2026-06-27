namespace sparkdates.Domain.Entities
{
    public class UserInterest : EntityBase
    {
        public Guid UserId { get; set; }
        public AppUser User { get; set; }

        public Guid InterestId { get; set; }
        public Interest Interest { get; set; }
    }
}
