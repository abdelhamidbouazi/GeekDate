namespace sparkdates.Domain.Entities
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public AppUser Sender { get; set; }
        public Guid ReceiverId { get; set; }
        public AppUser Receiver { get; set; }
        public string MessageText { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
        public Guid ConversationId { get; set; }
        public Conversation Conversation { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}