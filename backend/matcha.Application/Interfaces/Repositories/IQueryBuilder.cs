using matcha.Application.Helper;
using Microsoft.Data.SqlClient;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IQueryBuilder<T> where T : class
    {
        void ClearAll();
        string BuildCommand();
        string Build();
        IQueryBuilder<T> Count(string column, string groupBy, ICondition? condition = null, string orderBy = "", bool includeColumn = false);
        IQueryBuilder<T> Delete(T entity);
        IQueryBuilder<T> Delete(ICondition condition);
        SqlParameter[] GetParameters();
        IQueryBuilder<T> GroupBy(string column);
        IQueryBuilder<T> Having(string condition);
        IQueryBuilder<T> InnerJoin<TLeft, TRight>(string tableLeftIdentifier, string tableRightIdentifier, bool includeJoinedProps = false);
        IQueryBuilder<T> Insert(T entity);
        IQueryBuilder<T> Join<TJoin>(string joinType, string condition, bool includeJoinedProps = false);
        IQueryBuilder<T> LeftJoin<TLeft, TRight>(string tableLeftIdentifier, string tableRightIdentifier, bool includeJoinedProps = false);
        IQueryBuilder<T> OrderBy(params string[] columns);
        IQueryBuilder<T> RightJoin<TLeft, TRight>(string tableLeftIdentifier, string tableRightIdentifier, bool includeJoinedProps = false);
        IQueryBuilder<T> Select(params string[] columns);
        IQueryBuilder<T> SelectTop(int top);
        IQueryBuilder<T> SelectAll();
        IQueryBuilder<T> Update(Dictionary<string, object> columnValues);
        IQueryBuilder<T> Update(T entity);
        IQueryBuilder<T> Where(ICondition whereCondition);
    }
}
