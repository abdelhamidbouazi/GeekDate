using System.ComponentModel.DataAnnotations.Schema;

namespace matcha.Domain.Entities
{
    public class Conversation : EntityBase
    {
        public Guid User1Id { get; set; }
        public Guid User2Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public AppUser User { get; set; }
        public ICollection<Message> Messages { get; set; }

        [NotMapped]
        public int UnreadCount { get; set; }
    }
}
