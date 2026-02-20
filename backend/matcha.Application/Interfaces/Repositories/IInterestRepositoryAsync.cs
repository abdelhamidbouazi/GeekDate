using matcha.Application.Dtos.Interests;
using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IInterestRepositoryAsync : IGenericRepoAsync<Interest>
    {
        Task<IEnumerable<InterestDto>> GetInterestsWithNamesByUserIdAsync(Guid userId);
    }
}
