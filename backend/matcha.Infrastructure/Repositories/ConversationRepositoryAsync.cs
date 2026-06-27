using sparkdates.Application.Helper;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;

namespace sparkdates.Infrastructure.Repositories
{
    public class ConversationRepositoryAsync : GenericRepoAsync<Conversation>, IConversationRepositoryAsync
    {
        public ConversationRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Conversation> queryBuilder) : base(databaseService, queryBuilder)
        {

        }

        public Task<Conversation> GetConversationBetweenUsersAsync(Guid user1Id, Guid user2Id)
        {
            var query = @"
                SELECT * FROM Conversations
                WHERE (User1Id = @user1Id AND User2Id = @user2Id)
                   OR (User1Id = @user2Id AND User2Id = @user1Id)";

            var parameters = new[]
            {
                new SqlParameter("@user1Id", user1Id),
                new SqlParameter("@user2Id", user2Id)
            };

            return _database.QueryAndMapSingleAsync<Conversation>(query, parameters);
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
                ORDER BY ISNULL((SELECT MAX(m2.SentAt) FROM Messages m2 WHERE m2.ConversationId = c.Id), c.CreatedAt) DESC
                ";

            var parameters = new[] { new SqlParameter("@userId", userId) };

            var results = await _database.QueryAndMapAsync<Conversation>(query, parameters);

            return results;
        }
    }
}
