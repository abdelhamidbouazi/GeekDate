namespace matcha.Domain.Entities
{
    public class Message : EntityBase
    {
        public Guid SenderId { get; set; }
        public AppUser Sender { get; set; }
        public Guid ReceiverId { get; set; }
        public AppUser Receiver { get; set; }

        public string MessageText { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }

        public Guid ConversationId { get; set; }
        public Conversation Conversation { get; set; }
    }
}
