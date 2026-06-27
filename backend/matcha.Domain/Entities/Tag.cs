namespace sparkdates.Domain.Entities
{
    public class Tag : EntityBase
    {
        public string Name { get; set; }

        public string Color { get; set; } = string.Empty;
        public ICollection<UserTag> UserTags { get; set; }
    }
}
