using matcha.Application.Helper;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.Helpers;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;
using System.Linq.Expressions;

namespace matcha.Infrastructure.Repositories
{
    public class ConfirmEmailTokenRepositoryAsync : GenericRepoAsync<ConfirmEmailToken>, IConfirmEmailTokenRepositoryAsync
    {

        public ConfirmEmailTokenRepositoryAsync(IDatabaseService database, IQueryBuilder<ConfirmEmailToken> queryBuilder) : base(database, queryBuilder)
        {

        }
        public async Task<ConfirmEmailToken> GetConfirmEmailTokenByUserId(Guid userId)
        {
            Expression<Func<ConfirmEmailToken, bool>> predicate = (ConfirmEmailToken token) => token.Expired == false && token.ExpiredAt > DateTime.UtcNow && token.UserId == userId;
            var condition = new Condition(_expressionVisitor.GetWhereClause(predicate), GetSqlParameters(_expressionVisitor.GetParameters()));

            var query = _builder.SelectTop(1)
                .Where(condition)
                .OrderBy($"{nameof(ConfirmEmailToken.ExpiredAt)} desc")
                .Build();

            var mapper = async (SqlDataReader reader) =>
            {
                var confirmEmailToken = await SingleEntityMapper.MapSingle<ConfirmEmailToken>(reader);
                return confirmEmailToken;
            };

            var entity = await _database.QueryAndMapSingleAsync(query, _builder.GetParameters(), mapper);
            return entity;
        }

        public async Task UpdateAllTokensByUserId(Guid userId)
        {
            var query = $"update {nameof(ConfirmEmailToken)}s set {nameof(ConfirmEmailToken.Expired)}=@expired where {nameof(ConfirmEmailToken.UserId)}=@userId";
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@expired", true));
            parameters.Add(new SqlParameter("@userId", userId));
            await _database.ExecuteNonQueryAsync(query, parameters.ToArray());
        }
    }
}
