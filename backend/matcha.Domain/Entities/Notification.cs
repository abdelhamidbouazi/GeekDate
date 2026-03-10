using matcha.Domain.Common.Enums;

namespace matcha.Domain.Entities
{
    public class Notification : EntityBase
    {
        public Guid UserId { get; set; }
        public Guid FromUserId { get; set; }
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }

        public AppUser User { get; set; }
        public AppUser FromUser { get; set; }
    }
}
