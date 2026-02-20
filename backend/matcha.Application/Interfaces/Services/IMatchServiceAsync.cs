using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Services
{
    public interface IMatchServiceAsync
    {
        Task<Match> CreateMatchAsync(Guid user1Id, Guid user2Id);
        Task<bool> RemoveMatchAsync(Guid matchId);
        Task<bool> AreUsersMatchedAsync(Guid user1Id, Guid user2Id);
    }
}
