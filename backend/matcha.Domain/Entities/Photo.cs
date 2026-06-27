namespace sparkdates.Domain.Entities
{
    public class Photo : EntityBase
    {
        public required string Url { get; set; }
        public bool IsMain { get; set; }
        public string PublicId { get; set; }
        public Guid UserId { get; set; }

        public AppUser User { get; set; }
    }
}