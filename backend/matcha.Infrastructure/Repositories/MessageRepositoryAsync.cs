using matcha.Application.Helper;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.Helpers;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;

namespace matcha.Infrastructure.Repositories
{
    public class MessageRepositoryAsync : GenericRepoAsync<Message>, IMessageRepositoryAsync
    {
        public MessageRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Message> queryBuilder) : base(databaseService, queryBuilder) { }

        public async Task<IReadOnlyCollection<Message>> GetConversationMessagesAsync(Guid conversationId)
        {
            _builder.ClearAll();

            var query = _builder
                .LeftJoin<Message, AppUser>("SenderId", "Id", true) // include sender info
                .Where(new Condition("ConversationId=@conversationId", new SqlParameter("@conversationId", conversationId)))
                .SelectAll()
                .Build();

            var messages = await _database.QueryAndMapCollectionAsync<Message>(
                query,
                _builder.GetParameters(),
                async reader =>
                {
                    var mapper = new ParentChildEntityMapper<Message, AppUser, Guid>(reader, true)
                    {
                        MapChildToParent = (message, sender) =>
                        {
                            message.Sender = sender;
                        },
                        MapKey = message => message.Id
                    };
                    return await mapper.MapParentWithChilds(reader);
                });

            return messages;
        }

        public Task MarkAsReadAsync(Guid conversationId, Guid userId)
        {
            // Mark all unread messages in this conversation for this user as read
            var condition = new Condition(
                "ConversationId=@conversationId AND ReceiverId=@userId AND IsRead=0",
                new SqlParameter("@conversationId", conversationId),
                new SqlParameter("@userId", userId)
            );

            var query = _builder
                .Update(new Dictionary<string, object> { { "IsRead", 1 } })
                .Where(condition)
                .BuildCommand();

            return _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
        }
    }
}
