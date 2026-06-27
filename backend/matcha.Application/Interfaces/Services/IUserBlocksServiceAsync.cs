using sparkdates.Application.Dtos.UserBlocks;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IUserBlocksServiceAsync
    {
        Task<GetUsersBlocksDto> GetUsersBlocksAsync();
        Task<GetUserBlocksDto> GetUserBlocksAsync(Guid blockedUserId);
    }
}
