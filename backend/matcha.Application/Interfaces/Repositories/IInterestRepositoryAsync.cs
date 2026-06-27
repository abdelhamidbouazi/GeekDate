using sparkdates.Application.Dtos.Interests;
using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Repositories
{
    public interface IInterestRepositoryAsync : IGenericRepoAsync<Interest>
    {
        Task<IEnumerable<InterestDto>> GetInterestsWithNamesByUserIdAsync(Guid userId);
    }
}
