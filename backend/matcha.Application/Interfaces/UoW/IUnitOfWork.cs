namespace matcha.Application.Interfaces.UoW
{
    public interface IUnitOfWork
    {
        TRepository GetRepository<TRepository>() where TRepository : class;
        Task CreateTransaction();
        Task CommitTransaction();
        Task RollBackTransaction();
        Task<bool> CompleteAsync();
    }
}
