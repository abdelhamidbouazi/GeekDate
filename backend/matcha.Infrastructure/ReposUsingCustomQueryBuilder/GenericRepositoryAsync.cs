using sparkdates.Application.Dtos.Common;
using sparkdates.Application.Helper;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Infrastructure.Helpers;
using sparkdates.Shared.Extensions;
using Microsoft.Data.SqlClient;
using System.Linq.Expressions;

namespace sparkdates.Infrastructure.ReposUsingCustomQueryBuilder
{
    public class GenericRepositoryAsync<T> : IGenericRepoAsync<T> where T : class
    {
        protected readonly IDatabaseService _database;
        protected readonly IQueryBuilder<T> _builder;
        protected readonly SqlExpressionVisitor<T> _expressionVisitor;
        public GenericRepositoryAsync(IDatabaseService database, IQueryBuilder<T> builder)
        {
            _database = database;
            _builder = builder;
            _expressionVisitor = new SqlExpressionVisitor<T>();
        }
        public async Task<T> AddAsync(T entity)
        {
            _builder.ClearAll();
            var query = _builder.Insert(entity).BuildCommand();
            var result = await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
            if (result <= 0) return null;
            return entity;
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                var query = _builder.Insert(entity).BuildCommand();
                await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
            }
        }

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            var sqlWhereClause = _expressionVisitor.GetWhereClause(predicate);
            var condition = new Condition(sqlWhereClause, GetSqlParameters(_expressionVisitor.GetParameters()));
            var query = _builder.Count("", "", condition).Build();
            var result = await _database.ExecuteScalarAsync(query, _builder.GetParameters());

            return !result.IsNullOrEmpty() && result.IsNumber() && result.ToInt() > 0;
        }
        protected virtual SqlParameter[] GetSqlParameters(Dictionary<string, object> parameters)
        {
            return parameters.Select(x => new SqlParameter(x.Key, x.Value)).ToArray();
        }
        public async Task<int> Delete(T entity)
        {
            var query = _builder.Delete(entity).BuildCommand();
            return await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
        }

        public async Task DeleteRange(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                var query = _builder.Delete(entity).BuildCommand();
                await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
            }
        }

        public async Task Delete(Expression<Func<T, bool>> predicate)
        {
            var sqlWhereClause = _expressionVisitor.GetWhereClause(predicate);
            var condition = new Condition(sqlWhereClause, _builder.GetParameters());
            var query = _builder.Delete(condition).BuildCommand();
            await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
        }

        public async Task<T> FindAsync(Guid id)
        {
            Condition condition = new Condition("ID=@id", new[] { new SqlParameter("@id", id) });
            var query = _builder.Select()
                .Where(condition)
                .Build();
            var result = await _database.QueryAndMapSingleAsync<T>(query, _builder.GetParameters());

            return result;
        }


        public async Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            var sqlWhereClause = _expressionVisitor.GetWhereClause(predicate);
            var condition = new Condition(sqlWhereClause, GetSqlParameters(_expressionVisitor.GetParameters()));
            var query = _builder.Select().Where(condition).Build();

            var result = await _database.QueryAndMapSingleAsync<T>(query, _builder.GetParameters());

            return result;
        }

        public async Task<IReadOnlyCollection<T>> GetAllAsync()
        {
            var query = _builder.Select().Build();
            var results = await _database.QueryAndMapAsync<T>(query, _builder.GetParameters());

            return results;
        }

        public async Task<IReadOnlyCollection<T>> GetAllAsync(Expression<Func<T, bool>> predicate)
        {
            var sqlWhereClause = _expressionVisitor.GetWhereClause(predicate);
            var condition = new Condition(sqlWhereClause, GetSqlParameters(_expressionVisitor.GetParameters()));
            var query = _builder.Select().Where(condition).Build();

            var results = await _database.QueryAndMapAsync<T>(query, _builder.GetParameters());

            return results;
        }

        public async Task<int> Update(T entity)
        {
            var query = _builder.Update(entity).BuildCommand();
            return await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
        }

        public async Task Update(Expression<Func<T, bool>> predicate, T entity)
        {
            var columnValues = GetColumnValues(entity);

            var sqlWhereClause = _expressionVisitor.GetWhereClause(predicate);

            var condition = new Condition(sqlWhereClause, GetSqlParameters(_expressionVisitor.GetParameters()));

            var query = _builder.Update(columnValues).Where(condition).Build();

            await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
        }

        private Dictionary<string, object> GetColumnValues(T entity)
        {
            var columnValues = new Dictionary<string, object>();

            var properties = typeof(T).GetProperties();

            foreach (var property in properties)
            {
                if (property.Name == "Id")
                    continue;

                var columnName = property.Name;
                var columnValue = property.GetValue(entity);

                var parameterName = $@"{columnValue}";
                var sqlParameter = new SqlParameter(parameterName, columnValue ?? DBNull.Value);
                columnValues.Add(columnName, sqlParameter);
            }
            return columnValues;
        }

        public async Task<int> UpdateRange(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                var query = _builder.Update(entity).BuildCommand();
                await _database.ExecuteNonQueryAsync(query, _builder.GetParameters());
            }
            return entities.Count();
        }

        public async Task<PaginatedResult<T>> GetPagedAsync(int pageNumber, int pageSize, string orderBy = "Id Desc")
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            _builder.ClearAll();
            var countQuery = _builder.Count("*", "").Build();

            _builder.ClearAll();
            var dataQuery = _builder
                .Select()
                .OrderBy(orderBy)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Build();

            var (items, totalCount) = await _database.QueryPagedAsync<T>(dataQuery, countQuery, _builder.GetParameters());

            return new PaginatedResult<T>
            {
                Data = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };

        }

        public async Task<PaginatedResult<T>> GetPagedAsync(Expression<Func<T, bool>> predicate, int pageNumber, int pageSize, string orderBy = "Id Desc")
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 1;
            if (pageSize > 100) pageSize = 100;

            var sqlWhereClause = _expressionVisitor.GetWhereClause(predicate);
            var condition = new Condition(sqlWhereClause, GetSqlParameters(_expressionVisitor.GetParameters()));


            _builder.ClearAll();
            var countQuery = _builder
                    .Count("*", "")
                    .Build();

            _builder.ClearAll();
            var dataQuery = _builder
                .Select()
                .Where(condition)
                .OrderBy(orderBy)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Build();

            var (items, totalCount) = await _database.QueryPagedAsync<T>(dataQuery, countQuery, _builder.GetParameters());

            return new PaginatedResult<T>
            {
                Data = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }
    }
}
