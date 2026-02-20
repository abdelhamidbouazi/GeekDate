using matcha.Application.Dtos.Users;

namespace matcha.Application.Interfaces.Services
{
    public interface IMatchmakingServiceAsync
    {
        Task<IEnumerable<BrowseUserDto>> BrowseUsersAsync(Guid userId);
    }
}
