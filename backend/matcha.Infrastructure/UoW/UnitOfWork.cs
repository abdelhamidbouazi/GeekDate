using matcha.Application.Exceptions;
using matcha.Application.Interfaces.Services.Database;
using matcha.Application.Interfaces.UoW;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;

namespace matcha.Infrastructure.UoW
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly IDatabaseService _database;
        private readonly IServiceProvider _serviceProvider;
        private readonly Dictionary<Type, object> _repos;
        private IDbContextTransaction _transaction { get; set; }

        public UnitOfWork(IServiceProvider serviceProvider, IDatabaseService database)
        {
            _database = database;
            _serviceProvider = serviceProvider;
            _repos = new();
        }

        public TRepository GetRepository<TRepository>() where TRepository : class
        {
            if (_repos.TryGetValue(typeof(TRepository), out var repoType))
                return (TRepository)repoType;

            var repository = _serviceProvider.GetService<TRepository>();

            if (repository == null)
                throw new ApiException($"Repository for type {typeof(TRepository).Name} is not registered.");

            _repos.Add(typeof(TRepository), repository);
            return repository;
        }

        public async Task CreateTransaction()
        {
            await _database.BeginTransactionAsync();
        }

        public async Task CommitTransaction()
        {
            await _database.CommitTransactionAsync();
            await DisposeAsync();
        }

        public async Task<bool> CompleteAsync()
        {
            await _database.CommitTransactionAsync();
            return true;
        }

        public async Task RollBackTransaction()
        {
            if (_transaction is null) return;

            await _database.RollbackTransactionAsync();
            await DisposeAsync();
        }
        private async Task DisposeAsync()
        {
            if (_transaction is null) return;

            await _transaction.DisposeAsync();
        }
    }
}
