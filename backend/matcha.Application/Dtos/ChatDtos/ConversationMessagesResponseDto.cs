using matcha.Application.Dtos.Common;
using matcha.Domain.Entities;

namespace matcha.Application.Dtos.ChatDtos
{
    public class ConversationMessagesResponseDto
    {
        public PaginatedResult<Message> Messages { get; set; }
        public bool IsBlocked { get; set; }
    }
}
