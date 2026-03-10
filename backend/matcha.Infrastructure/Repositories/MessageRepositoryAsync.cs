using matcha.Application.Dtos.Common;
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

        public async Task<bool> DeleteMessageAsync(Guid messageId, Guid userId)
        {
            _builder.ClearAll();

            var condition = new Condition("Id =@messageId AND SenderId=@userId",
                    new SqlParameter("messageId", messageId),
                    new SqlParameter("@userId", userId));

            var query = _builder
                       .Delete(condition)
                       .BuildCommand();

            var rowsAffected = await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());

            return rowsAffected > 0;
        }


        public async Task<IReadOnlyCollection<Message>> GetConversationMessagesAsync(Guid conversationId)
        {
            _builder.ClearAll();

            var query = _builder
                .LeftJoin<Message, AppUser>("SenderId", "Id", true)
                .Where(new Condition("ConversationId=@conversationId",
                new SqlParameter("@conversationId", conversationId)))
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

        public async Task<PaginatedResult<Message>> GetConversationMessagesPagedAsync(
             Guid conversationId,
             int pageNumber,
             int pageSize)
        {
            int skip = (pageNumber - 1) * pageSize;

            _builder.ClearAll();

            var countQuery = _builder
                .Count("*", "")
                .Where(new Condition("ConversationId=@conversationId",
                    new SqlParameter("@conversationId", conversationId)))
                .Build();

            _builder.ClearAll();
            var dataQuery = _builder
                .LeftJoin<Message, AppUser>("SenderId", "Id", true)
                .Where(new Condition("ConversationId=@conversationId",
                    new SqlParameter("@conversationId", conversationId)))
                .SelectAll()
                .OrderBy("SentAt DESC")
                .Skip(skip)
                .Take(pageSize)
                .Build();

            var (messages, totalCount) = await _database.QueryPagedWithReaderAsync<Message>(
                dataQuery,
                countQuery,
                _builder.GetParameters(),
                async reader =>
                {
                    // ParentChildEntityMapper gère le while (await reader.ReadAsync()) en interne
                    var mapper = new ParentChildEntityMapper<Message, AppUser, Guid>(reader, true)
                    {
                        MapChildToParent = (message, sender) => message.Sender = sender,
                        MapKey = message => message.Id
                    };
                    return await mapper.MapParentsWithChilds(reader);
                }
            );

            return new PaginatedResult<Message>
            {
                Data = messages,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

        }

        public async Task<int> GetUnreadCountAsync(Guid conversationId, Guid userId)
        {
            _builder.ClearAll();

            var condition = new Condition(
                "ConversationId=@conversationId AND ReceiverId=@userId AND IsRead=0",
                new SqlParameter("@conversationId", conversationId),
                new SqlParameter("@userId", userId)
            );

            var query = _builder
                .Count("*", "")
                .Where(condition)
                .Build();

            var result = await _database.ExecuteScalarAsync(query, _builder.GetParameters());

            return int.TryParse(result, out var count) ? count : 0;
        }

        public async Task MarkAsReadAsync(Guid conversationId, Guid userId)
        {
            _builder.ClearAll();

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

            await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
        }

        public async Task<bool> UpdateMessageAsync(Guid messageId, Guid userId, string newContent)
        {
            _builder.ClearAll();

            var condition = new Condition("Id=@messageId AND SenderId=@userId",
                new SqlParameter("@messageId", messageId),
                new SqlParameter("@userId", userId));

            var query = _builder
                        .Update(new Dictionary<string, object>
                        {
                            { "MessageText", newContent },
                            { "UpdatedAt", DateTime.UtcNow }
                        })
                    .Where(condition)
                    .BuildCommand();

            var rowsAffected = await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());

            return rowsAffected > 0;
        }
    }
}
