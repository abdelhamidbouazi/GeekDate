using matcha.Application.Helper;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;

namespace matcha.Infrastructure.Repositories
{
    public class ConversationRepositoryAsync : GenericRepoAsync<Conversation>, IConversationRepositoryAsync
    {
        public ConversationRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Conversation> queryBuilder) : base(databaseService, queryBuilder)
        {

        }

        public Task<Conversation> GetConversationBetweenUsersAsync(Guid user1Id, Guid user2Id)
        {
            _builder.ClearAll();

            var condition = new Condition(
                "(User1Id=@user1Id AND User2Id=@user2Id) OR (User1Id=@user2Id AND User2Id=@user1Id)",
                new SqlParameter("@user1Id", user1Id),
                new SqlParameter("@user2Id", user2Id)
            );

            var query = _builder
                .Select()
                .Where(condition)
                .Build();

            var conversation = _database.QueryAndMapSingleAsync<Conversation>(
                query,
                _builder.GetParameters()
            );

            return conversation;
        }

        public async Task<IReadOnlyCollection<Conversation>> GetUserConversationsWithUnreadCountAsync(Guid userId)
        {
            var query = @"
            SELECT 
                c.Id,
                c.User1Id,
                c.User2Id,
                c.CreatedAt,
                ISNULL((
                SELECT COUNT(*) 
                FROM Messages m 
                WHERE m.ConversationId = c.Id 
                  AND m.ReceiverId = @userId 
                  AND m.IsRead = 0
                    ), 0) AS UnreadCount
                FROM Conversations c
                WHERE c.User1Id = @userId OR c.User2Id = @userId
                ORDER BY c.CreatedAt DESC
                ";

            var parameters = new[] { new SqlParameter("@userId", userId) };

            var results = await _database.QueryAndMapAsync<Conversation>(query, parameters);

            return results;
        }
    }
}
