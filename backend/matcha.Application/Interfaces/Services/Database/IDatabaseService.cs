using Microsoft.Data.SqlClient;

namespace sparkdates.Application.Interfaces.Services.Database
{
    public interface IDatabaseService : IDisposable
    {
        Task<T> QueryAndMapSingleAsync<T>(string query, SqlParameter[] parameters, Func<SqlDataReader, Task<T>> mapFunc) where T : class;
        Task<IReadOnlyList<T>> QueryAndMapCollectionAsync<T>(string query, SqlParameter[] parameters, Func<SqlDataReader, Task<T>> mapFunc) where T : class;
        Task<IReadOnlyList<T>> QueryAndMapCollectionAsync<T>(string query, Func<SqlDataReader, T> mapFunc) where T : class;
        Task<IReadOnlyList<T>> QueryAndMapAsync<T>(string query, SqlParameter[] parameters) where T : class;
        Task<T> QueryAndMapSingleAsync<T>(string query, SqlParameter[] parameters) where T : class;
        Task<int> ExecuteNonQueryAsync(string query, SqlParameter[] parameters);
        Task<int> ExecuteAsync(string query, SqlParameter[] parameters);
        Task<string> ExecuteScalarAsync(string query, SqlParameter[] parameters);
        Task<(IReadOnlyList<T> Items, int TotalCount)> QueryPagedAsync<T>(string dataQuery, string countQuery, SqlParameter[] parameters) where T : class;
        Task<(IReadOnlyList<T> Items, int TotalCount)> QueryPagedWithReaderAsync<T>(string dataQuery, string countQuery, SqlParameter[] parameters,
            Func<SqlDataReader, Task<IReadOnlyList<T>>> mapFunc) where T : class;
        Task BeginTransactionAsync();
        Task RollbackTransactionAsync();
        Task CommitTransactionAsync();
        new Task Dispose();
    }
}
