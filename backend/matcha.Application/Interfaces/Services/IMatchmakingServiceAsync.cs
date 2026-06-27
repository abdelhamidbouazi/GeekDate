using sparkdates.Application.Dtos.Users;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IMatchmakingServiceAsync
    {
        Task<IEnumerable<BrowseUserDto>> BrowseUsersAsync(Guid userId);
    }
}
