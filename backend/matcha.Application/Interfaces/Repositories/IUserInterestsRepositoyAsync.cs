using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IUserInterestsRepositoyAsync : IGenericRepoAsync<UserInterest>
    {
        Task<IReadOnlyList<UserInterest>> GetUserInterestsByUserIdAsync(Guid userId);
    }
}
