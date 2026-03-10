using matcha.Application.Dtos.Common;
using System.Linq.Expressions;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IGenericRepoAsync<T> where T : class
    {
        Task<IReadOnlyCollection<T>> GetAllAsync();
        Task<IReadOnlyCollection<T>> GetAllAsync(Expression<Func<T, bool>> predicate);
        Task<T> FindAsync(Guid id);
        Task<T> AddAsync(T entity);
        Task<int> Update(T entity);
        Task<int> UpdateRange(IEnumerable<T> entities);
        Task<int> Delete(T entity);
        Task Delete(Expression<Func<T, bool>> expression);

        Task AddRangeAsync(IEnumerable<T> entities);
        Task DeleteRange(IEnumerable<T> entities);
        Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);

        /// <summary>
        /// Get paginited resukts withoiut filter
        /// </summary>
        Task<PaginatedResult<T>> GetPagedAsync(int pageNumber, int pageSize, string orderBy = "Id Desc");

        /// <summary>
        /// Get paginated results with filter
        /// </summary>
        Task<PaginatedResult<T>> GetPagedAsync(Expression<Func<T, bool>> predicate, int pageNumber, int pageSize, string orderBy = "Id Desc");


    }
}
