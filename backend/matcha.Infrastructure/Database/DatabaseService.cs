using matcha.Application.Interfaces.Services.Database;
using matcha.Infrastructure.ApplicationDbContext;
using matcha.Infrastructure.Helpers;
using Microsoft.Data.SqlClient;
using System.Data;

namespace matcha.Infrastructure.Database
{
    public class DatabaseService : IDatabaseService
    {
        //private readonly string _connectionString;
        private readonly SqlConnection _sqlConnection;
        //private readonly IConfiguration _configuration;
        private SqlTransaction _dbTransaction;

        public DatabaseService(SqlConnection connection, AppDbContext context)
        {
            //_configuration = configuration;
            //_connectionString = configuration.GetConnectionString("default");
            //_sqlConnection = new SqlConnection(_connectionString);
            _sqlConnection = connection;

            //context.Users.FromSqlRaw("",);
        }
        private async Task OpenAsync()
        {
            if (_sqlConnection.State != ConnectionState.Open)
                await _sqlConnection.OpenAsync();
        }
        private async Task CloseAsync()
        {
            if (_sqlConnection.State == ConnectionState.Open)
                await _sqlConnection.CloseAsync();
        }

        public async Task<int> ExecuteNonQueryAsync(string query, SqlParameter[] parameters)
        {
            await OpenAsync();
            using (var command = new SqlCommand(query, _sqlConnection))
            {
                if (_dbTransaction != null)
                    command.Transaction = _dbTransaction;


                if (parameters != null && parameters.Any())
                    command.Parameters.AddRange(parameters);

                return await command.ExecuteNonQueryAsync();

            }
        }
        public async Task BeginTransactionAsync()
        {
            if (_dbTransaction == null)
            {
                await OpenAsync();
                _dbTransaction = await _sqlConnection.BeginTransactionAsync() as SqlTransaction;
            }

        }

        public async Task CommitTransactionAsync()
        {
            if (_dbTransaction != null)
            {
                await _dbTransaction.CommitAsync();
                await _dbTransaction.DisposeAsync();
                _dbTransaction = null;
            }
        }

        public Task Dispose()
        {
            throw new NotImplementedException();
        }

        public async Task<string> ExecuteScalarAsync(string query, SqlParameter[] parameters)
        {
            await OpenAsync();
            object result = null;
            using (var command = new SqlCommand(query, _sqlConnection))
            {
                if (parameters != null && parameters.Any())
                    command.Parameters.AddRange(parameters);
                if (_dbTransaction is not null)
                    command.Transaction = _dbTransaction;

                result = await command.ExecuteScalarAsync();
            }

            return result != null ? result.ToString() : string.Empty;
        }

        public async Task<T> QueryAndMapSingleAsync<T>(string query, SqlParameter[] parameters, Func<SqlDataReader, Task<T>> mapFunc) where T : class
        {
            await OpenAsync();
            T result = null;

            using (var command = new SqlCommand(query, _sqlConnection))
            {
                if (parameters != null && parameters.Any())
                    command.Parameters.AddRange(parameters);
                if (_dbTransaction is not null)
                    command.Transaction = _dbTransaction;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    result = await mapFunc(reader);
                }
            }

            return result;
        }
        public async Task<IReadOnlyList<T>> QueryAndMapCollectionAsync<T>(string query, SqlParameter[] parameters, Func<SqlDataReader, Task<T>> mapFunc) where T : class
        {
            await OpenAsync();
            var results = new List<T>();

            using (var command = new SqlCommand(query, _sqlConnection))
            {
                if (parameters != null && parameters.Any())
                    command.Parameters.AddRange(parameters);
                if (_dbTransaction is not null)
                    command.Transaction = _dbTransaction;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        results.Add(await mapFunc(reader));

                    }
                }
            }
            return results;
        }

        public async Task<IReadOnlyList<T>> QueryAndMapAsync<T>(string query, SqlParameter[] parameters) where T : class
        {
            await OpenAsync();
            var results = new List<T>();

            using (var command = new SqlCommand(query, _sqlConnection))
            {
                if (parameters != null && parameters.Any())
                    command.Parameters.AddRange(parameters);
                if (_dbTransaction is not null)
                    command.Transaction = _dbTransaction;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var instance = SingleEntityMapper.MapSingleWitoutExecutingReader<T>(reader);
                        results.Add(instance);
                    }
                }
            }

            return results;
        }
        public async Task<T> QueryAndMapSingleAsync<T>(string query, SqlParameter[] parameters) where T : class
        {
            await OpenAsync();
            T result = default;

            using (var command = new SqlCommand(query, _sqlConnection))
            {
                if (parameters != null && parameters.Any())
                    command.Parameters.AddRange(parameters);
                if (_dbTransaction is not null)
                    command.Transaction = _dbTransaction;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var instance = SingleEntityMapper.MapSingleWitoutExecutingReader<T>(reader);
                        result = instance;
                    }
                }
            }

            return result;
        }
        public async Task RollbackTransactionAsync()
        {
            if (_dbTransaction != null)
            {
                await _dbTransaction.RollbackAsync();
                await _dbTransaction.DisposeAsync();
                _dbTransaction = null;
            }
        }

        void IDisposable.Dispose()
        {
            _dbTransaction?.Dispose();
        }

        public Task<int> ExecuteAsync(string query, SqlParameter[] parameters)
        {
            throw new NotImplementedException();
        }

        public async Task<IReadOnlyList<T>> QueryAndMapCollectionAsync<T>(string query, Func<SqlDataReader, T> mapFunc) where T : class
        {
            await OpenAsync();
            var results = new List<T>();

            using (var command = new SqlCommand(query, _sqlConnection))
            {
                if (_dbTransaction is not null)
                    command.Transaction = _dbTransaction;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                        results.Add(mapFunc(reader));
                }
            }

            return results;
        }
    }
}
