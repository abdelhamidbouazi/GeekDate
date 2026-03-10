using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.UoW;
using matcha.Domain.Entities;

namespace matcha.DomainServices.Chat
{
    public class ConversationValidatorService : IConversationValidatorService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ConversationValidatorService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Conversation> ValidateConversationExistsAsync(Guid conversationId)
        {
            if (conversationId == Guid.Empty)
            {
                throw new ArgumentException("Conversation ID cannot be empty", nameof(conversationId));
            }

            var conversation = await _unitOfWork
                .GetRepository<IConversationRepositoryAsync>()
                .FindAsync(conversationId);

            if (conversation == null)
            {
                throw new InvalidOperationException($"Conversation with ID {conversationId} not found");
            }
            
            return conversation;
        }
    }
}
