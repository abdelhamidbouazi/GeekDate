namespace matcha.Application.Dtos.ChatDtos
{
    public class SendMessageDto
    {
        public Guid ReceiverId { get; set; }
        public string MessageText { get; set; }
    }
}
