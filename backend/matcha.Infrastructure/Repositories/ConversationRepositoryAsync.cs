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
            var condition = new Condition($"{nameof(Conversation.User1Id)}=@user1Id AND {nameof(Conversation.User2Id)}=@user2Id",
                new SqlParameter("@user1Id", user1Id),
                new SqlParameter("@user2Id", user2Id));

            var query = _builder.Select()
                .Where(condition)
                .Build();

            var conversation = _database.QueryAndMapSingleAsync<Conversation>(query, _builder.GetParameters());

            return conversation;
        }
    }
}
