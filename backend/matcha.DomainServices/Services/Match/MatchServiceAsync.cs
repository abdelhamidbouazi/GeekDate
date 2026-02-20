using matcha.Application.Exceptions;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.Services.Authentication;
using matcha.Application.Interfaces.UoW;
using matcha.Domain.Entities;

public class MatchServiceAsync : IMatchServiceAsync
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthenticatedUser _authenticatedUser;

    public MatchServiceAsync(
        IUnitOfWork unitOfWork,
        IAuthenticatedUser authenticatedUser)
    {
        _unitOfWork = unitOfWork;
        _authenticatedUser = authenticatedUser;
    }

    public async Task<Match> CreateMatchAsync(Guid user1Id, Guid user2Id)
    {
        var authenticatedUserId = (await _authenticatedUser.GetAuthenticatedAsync())?.Id
            ?? throw new ApiException("Unauthorized operation.");

        if (authenticatedUserId != user1Id && authenticatedUserId != user2Id)
            throw new ApiException("Operation not allowed.");

        var matchRepository = _unitOfWork.GetRepository<IMatchRepositoryAsync>();

        return await matchRepository.AddAsync(new Match
        {
            User1Id = user1Id,
            User2Id = user2Id,
            MatchedAt = DateTime.UtcNow
        });
    }

    public async Task<bool> AreUsersMatchedAsync(Guid user1Id, Guid user2Id)
    {
        var authenticatedUserId = (await _authenticatedUser.GetAuthenticatedAsync())?.Id
            ?? throw new ApiException("Unauthorized operation.");

        if (authenticatedUserId != user1Id && authenticatedUserId != user2Id)
            throw new ApiException("Operation not allowed.");

        var matchRepository = _unitOfWork.GetRepository<IMatchRepositoryAsync>();

        return await matchRepository.AnyAsync(m =>
            (m.User1Id == user1Id && m.User2Id == user2Id) ||
            (m.User1Id == user2Id && m.User2Id == user1Id));
    }

    public async Task<bool> RemoveMatchAsync(Guid matchId)
    {
        var authenticatedUserId = (await _authenticatedUser.GetAuthenticatedAsync())?.Id
            ?? throw new ApiException("Unauthorized operation.");

        var matchRepository = _unitOfWork.GetRepository<IMatchRepositoryAsync>();

        var match = await matchRepository.FirstOrDefaultAsync(m =>
            m.Id == matchId &&
            (m.User1Id == authenticatedUserId || m.User2Id == authenticatedUserId));

        if (match == null)
            throw new ApiException("Operation not allowed.");

        return await matchRepository.Delete(match) > 0;
    }
}
