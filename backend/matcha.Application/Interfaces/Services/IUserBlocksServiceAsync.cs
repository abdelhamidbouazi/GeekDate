using matcha.Application.Dtos.UserBlocks;

namespace matcha.Application.Interfaces.Services
{
    public interface IUserBlocksServiceAsync
    {
        Task<GetUsersBlocksDto> GetUsersBlocksAsync();
        Task<GetUserBlocksDto> GetUserBlocksAsync(Guid blockedUserId);
    }
}
