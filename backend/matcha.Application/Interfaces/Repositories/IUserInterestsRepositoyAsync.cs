using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Repositories
{
    public interface IUserInterestsRepositoyAsync : IGenericRepoAsync<UserInterest>
    {
        Task<IReadOnlyList<UserInterest>> GetUserInterestsByUserIdAsync(Guid userId);
    }
}
