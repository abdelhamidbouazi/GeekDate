using sparkdates.Application.Exceptions;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.Interfaces.UoW;
using sparkdates.Domain.Entities;

namespace sparkdates.DomainServices.Chat
{
    public class ConversationServiceAsync : IConversationServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthenticatedUser _authenticatedUser;
        private readonly IMatchServiceAsync _matchServiceAsync;
        public ConversationServiceAsync(IUnitOfWork unitOfWork, IAuthenticatedUser authenticatedUser, IMatchServiceAsync matchServiceAsync)
        {
            _unitOfWork = unitOfWork;
            _authenticatedUser = authenticatedUser;
            _matchServiceAsync = matchServiceAsync;
        }
        public async Task<Conversation?> GetConversationBetweenUsersAsync(Guid user1Id, Guid user2Id)
        {
            if (user1Id == user2Id)
                throw new ApiException("Invalid operation");

            var conversation = await _unitOfWork.GetRepository<IConversationRepositoryAsync>().GetConversationBetweenUsersAsync(user1Id, user2Id);

            return conversation;
        }

        public async Task<Conversation> GetOrCreateConversationAsync(Guid userId)
        {
            var authenticatedUser = await _authenticatedUser.GetAuthenticatedAsync();

            if (authenticatedUser == null)
                throw new ApiException("Unauthorized operation.");

            if (authenticatedUser.Id == userId)
                throw new ApiException("Invalid operation");

            var conversationRepository = _unitOfWork.GetRepository<IConversationRepositoryAsync>();

            var conversation = await conversationRepository.GetConversationBetweenUsersAsync(authenticatedUser.Id, userId);

            if (conversation is not null)
                return conversation;

            var isMatched = await _matchServiceAsync.AreUsersMatchedAsync(authenticatedUser.Id, userId);

            if (!isMatched)
                throw new ApiException("Users are not matched. Cannot create conversation.");

            conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                User1Id = authenticatedUser.Id,
                User2Id = userId,
                CreatedAt = DateTime.UtcNow
            };

            return await conversationRepository.AddAsync(conversation);
        }

        public async Task<Conversation> CreateConversationWithUserAsync(Guid userId)
        {
            var authenticatedUser = await _authenticatedUser.GetAuthenticatedAsync();

            if (authenticatedUser == null)
                throw new ApiException("Unauthorized operation.");

            if (authenticatedUser.Id == userId)
                throw new ApiException("Invalid operation");

            var userLikeRepository = _unitOfWork.GetRepository<IUserLikesRepositoryAsync>();

            var isMatched = await _matchServiceAsync.AreUsersMatchedAsync(authenticatedUser.Id, userId);

            if (!isMatched)
                throw new ApiException("Users are not matched. Cannot create conversation.");

            var conversationRepository = _unitOfWork.GetRepository<IConversationRepositoryAsync>();

            var existingConversation = await conversationRepository.GetConversationBetweenUsersAsync(authenticatedUser.Id, userId);

            if (existingConversation != null)
                throw new ApiException("Conversation already exists.");

            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                User1Id = authenticatedUser.Id,
                User2Id = userId,
                CreatedAt = DateTime.UtcNow

            };

            return await _unitOfWork.GetRepository<IConversationRepositoryAsync>().AddAsync(conversation);
        }

        public async Task<bool> DeleteConversationAsync(Guid conversationId)
        {
            var conversation = await _unitOfWork.GetRepository<IConversationRepositoryAsync>().FindAsync(conversationId);

            if (conversation == null)
                throw new ApiException("Conversation not found.");

            return await _unitOfWork.GetRepository<IConversationRepositoryAsync>().Delete(conversation) > 0;
        }

        public Task<IReadOnlyCollection<Conversation>> GetUserConversationsAsync(Guid userId)
        {
            var repo = _unitOfWork.GetRepository<IConversationRepositoryAsync>();

            return repo.GetUserConversationsWithUnreadCountAsync(userId);
        }
    }
}
