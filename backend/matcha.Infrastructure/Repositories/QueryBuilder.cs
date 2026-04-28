using matcha.Application.Helper;
using matcha.Application.Interfaces.Repositories;
using Microsoft.Data.SqlClient;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace matcha.Infrastructure.Repositories
{
    public class QueryBuilder<T> : IQueryBuilder<T> where T : class
    {
        private string _query = "";
        private string _join = "";
        private string _orderBy = "";
        private string _groupBy = "";
        private string _having = "";
        private string _where = "";
        private string _skip = "";
        private string _take = "";
        private List<Type> _tableTypes = new List<Type>();
        private List<SqlParameter> _parameters = new();
        private string _tableName = "";
        public QueryBuilder()
        {
            _tableTypes.Add(typeof(T));
            _tableName = typeof(T).Name + "s";
        }

        public IQueryBuilder<T> Select(params string[] columns)
        {
            ClearAll();
            if (columns == null || columns.Length == 0)
            {
                _query = "SELECT * ";
                return this;
            }
            _query = "SELECT " + string.Join(", ", columns);

            _parameters.Clear();

            return this;
        }
        public IQueryBuilder<T> SelectTop(int top)
        {
            ClearAll();
            _query = $"SELECT TOP {top} * ";

            _parameters.Clear();

            return this;
        }
        public IQueryBuilder<T> Count(string column, string groupBy, ICondition? condition = null, string orderBy = "", bool includeColumn = false)
        {
            ClearAll();
            _query = $"SELECT ";
            if (includeColumn)
                _query += $"{column},";
            _query += " count(*) ";

            if (!string.IsNullOrEmpty(groupBy) && !string.IsNullOrEmpty(column))
                _groupBy = $" GROUP BY {groupBy}";

            _parameters.Clear();

            if (condition is not null)
            {
                _where += $" WHERE {condition.Clause}";
                _parameters.AddRange(condition.Parameters);
            }

            if (!string.IsNullOrEmpty(orderBy))
                _orderBy += $" ORDER BY {orderBy}";

            return this;
        }

        public IQueryBuilder<T> SelectAll()
        {
            _query = "SELECT ";
            foreach (var _table in _tableTypes)
            {
                var properties = _table.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Where(x => IsSimple(x.PropertyType) && x.Name.ToLower() != "id")
                    .Select(p => $"{_table.Name}s.{p.Name}")
                    .ToList();
                if (_table.GetProperty("Id") != null)
                    properties.Add($"{_table.Name}s.Id as {_table.Name}Id");
                _query += $"{string.Join(", ", properties)} ,";
            }
            _query = _query.Substring(0, _query.Length - 2);

            return this;
        }
        private bool IsSimple(Type type)
        {
            // Check for nullable types
            if (Nullable.GetUnderlyingType(type) != null)
            {
                type = Nullable.GetUnderlyingType(type);
            }

            return type.IsPrimitive                     // int, bool, etc.
                || type.IsEnum                           // enums
                || type == typeof(string)
                || type == typeof(decimal)
                || type == typeof(DateTime)
                || type == typeof(DateTimeOffset)
                || type == typeof(TimeSpan)
                || type == typeof(Guid)
                || type == typeof(byte[]);
        }
        private bool ContainsAlias(string column)
        {
            // Check if the column contains a dot, indicating a table alias (e.g., e.Name)
            return column.Contains(".");
        }

        private bool IsSqlExpression(string column)
        {
            // Check if the column contains SQL-specific syntax (e.g., parentheses for functions)
            return column.Contains("(") || column.Contains(")") || column.Contains(" AS ", StringComparison.OrdinalIgnoreCase);
        }
        private string From(string table)
        {
            return $" FROM {table} ";
        }

        public IQueryBuilder<T> Where(ICondition whereCondition)
        {
            if (!_where.Contains("WHERE"))
                _where += " WHERE ";

            _where += whereCondition.Clause;

            _parameters.Clear();

            if (whereCondition.Parameters.Length > 0)
                _parameters.AddRange(whereCondition.Parameters);

            return this;
        }
        public SqlParameter[] GetParameters() => _parameters.ToArray();

        public IQueryBuilder<T> Join<TJoin>(string joinType, string condition, bool includeJoinedProps = false)
        {
            string joinTableRight = typeof(TJoin).Name;

            if (!_tableTypes.Contains(typeof(TJoin)) && includeJoinedProps)
                _tableTypes.Add(typeof(TJoin));

            _join += $" {joinType} JOIN {joinTableRight}s ON {condition} ";
            return this;
        }

        public IQueryBuilder<T> InnerJoin<TLeft, TRight>(string tableLeftIdentifier, string tableRightIdentifier, bool includeJoinedProps = false)
       => Join<TRight>("INNER", $"{typeof(TLeft).Name}s.{tableLeftIdentifier} = {typeof(TRight).Name}s.{tableRightIdentifier}", includeJoinedProps);

        public IQueryBuilder<T> LeftJoin<TLeft, TRight>(string tableLeftIdentifier, string tableRightIdentifier, bool includeJoinedProps = false)
            => Join<TRight>("LEFT", $"{typeof(TLeft).Name}s.{tableLeftIdentifier} = {typeof(TRight).Name}s.{tableRightIdentifier}", includeJoinedProps);

        public IQueryBuilder<T> RightJoin<TLeft, TRight>(string tableLeftIdentifier, string tableRightIdentifier, bool includeJoinedProps = false)
            => Join<TRight>("RIGHT", $"{typeof(TLeft).Name}s.{tableLeftIdentifier} = {typeof(TRight).Name}s.{tableRightIdentifier}", includeJoinedProps);

        public IQueryBuilder<T> OrderBy(params string[] columns)
        {
            _orderBy += $" ORDER BY {string.Join(",", columns)} ";
            return this;
        }
        public IQueryBuilder<T> GroupBy(string column)
        {
            _groupBy += $" GROUP BY {column} ";
            return this;
        }
        public IQueryBuilder<T> Having(string condition)
        {
            _having += $" HAVING {condition} ";
            return this;
        }

        public IQueryBuilder<T> Insert(T entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            ClearAll();
            // use reflection to get all the properties of the entity
            var properties = typeof(T).GetProperties().Where(x => IsSimple(x.PropertyType) && !Attribute.IsDefined(x, typeof(NotMappedAttribute))).OrderBy(x => x.Name);

            var columns = properties.Select(p => p.Name).ToArray();

            // Ensure columns and values match
            //if (columns.Length != values.Length)
            //    throw new ArgumentException("The number of columns must match the number of values.");
            _parameters.Clear();
            string columnNames = string.Join(", ", columns);
            var paramsList = new List<string>();
            foreach (var prop in properties)
            {
                var value = prop.GetValue(entity);
                if (value != null && value.GetType().IsEnum)
                    value = (int)value;
                _parameters.Add(new SqlParameter($"@{prop.Name}", value ?? DBNull.Value));
                paramsList.Add($"@{prop.Name}");
            }

            _query = $"INSERT INTO {entity.GetType().Name}s ({columnNames}) VALUES ({string.Join(",", paramsList)})";

            return this;
        }

        public IQueryBuilder<T> Delete(T entity)
        {
            ClearAll();
            var tableName = typeof(T).Name;

            _query = $"DELETE FROM {tableName}s Where id=@id";
            _parameters.Add(new SqlParameter("@id", entity.GetType().GetProperty("Id")?.GetValue(entity) ?? DBNull.Value));
            return this;
        }

        public IQueryBuilder<T> Delete(ICondition condition)
        {
            ClearAll();
            _query = $"DELETE FROM {_tableName}";
            _where = $" WHERE {condition.Clause}";
            _parameters.AddRange(condition.Parameters);
            return this;
        }

        public IQueryBuilder<T> Update(Dictionary<string, object> columnValues)
        {
            if (columnValues == null || columnValues.Count == 0)
                throw new ArgumentNullException("no columns to update");

            var tableName = typeof(T).Name;

            _query = $"UPDATE {tableName}s SET ";

            var setClause = string.Join(", ", columnValues.Select(kv => $"{kv.Key} = {FormatValue(kv.Value)}"));

            _query += setClause;

            return this;
        }
        public void ClearAll()
        {
            _query = string.Empty;
            _orderBy = string.Empty;
            _having = string.Empty;
            _join = string.Empty;
            _groupBy = string.Empty;
            _tableTypes = _tableTypes.Where(x => x == typeof(T)).ToList();
            _where = string.Empty;
            _skip = string.Empty;
            _take = string.Empty;
            _parameters.Clear();
        }
        public IQueryBuilder<T> Take(int count)
        {
            _take = $" FETCH NEXT {count} ROWS ONLY ";
            return this;
        }

        public IQueryBuilder<T> Skip(int count)
        {
            _skip = $" OFFSET {count} ROWS ";
            return this;
        }
        public IQueryBuilder<T> Update(T entity)
        {
            ClearAll();
            var tableName = typeof(T).Name;

            _query = $"UPDATE {tableName}s SET ";

            var properties = entity.GetType().GetProperties().Where(x => IsSimple(x.PropertyType) && !Attribute.IsDefined(x, typeof(NotMappedAttribute)));

            foreach (var prop in properties)
            {
                if (prop.Name.ToLower() != "id")
                {
                    _query += $"{prop.Name} = @{prop.Name},";
                    var value = prop.GetValue(entity);
                    if (value != null && value.GetType().IsEnum)
                        value = (int)value;
                    _parameters.Add(new SqlParameter($"@{prop.Name}", value ?? DBNull.Value));
                }
            }
            _query = _query.Substring(0, _query.Length - 1);

            _query += " WHERE Id = @id";
            _parameters.Add(new SqlParameter("@id", entity.GetType().GetProperty("Id")?.GetValue(entity) ?? DBNull.Value));
            return this;
        }
        // Helper method to format values for SQL
        private string FormatValue(object value)
        {
            if (value == null) return "NULL";
            if (value is string || value is DateTime)
                return $"'{value.ToString().Replace("'", "''")}'"; // Escape single quotes for SQL strings
            return value.ToString(); // For numeric or other types
        }

        public string Build()
        {
            return $"{_query}{From(_tableName)} {_join} {_where} {_groupBy} {_having} {_orderBy} {_skip} {_take} ";
        }
        public string BuildCommand() => $"{_query} {_where}";
    }
}
