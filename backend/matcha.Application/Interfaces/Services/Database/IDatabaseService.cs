using Microsoft.Data.SqlClient;

namespace matcha.Application.Interfaces.Services.Database
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
        Task BeginTransactionAsync();
        Task RollbackTransactionAsync();
        Task CommitTransactionAsync();
        new Task Dispose();
    }
}
