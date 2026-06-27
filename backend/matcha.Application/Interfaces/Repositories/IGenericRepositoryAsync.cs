using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;

namespace sparkdates.Application.Interfaces.Repositories
{
    public interface IGenericRepositoryAsync<T> where T : class
    {
        Task<IReadOnlyCollection<T>> GetAllAsync();
        Task<IReadOnlyCollection<T>> GetAllAsync(Expression<Func<T, bool>> predicate);
        Task<T> FindAsync(Guid id);
        Task<T> FindAsync(Guid id, Func<IQueryable<T>, IIncludableQueryable<T, object>> include);
        Task<T> AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        void DeleteRange(IEnumerable<T> entities);
        Task<bool> SaveChangesAsync();
        Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, bool noTracking = false);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
        public void Detach(T entity);
    }
}
