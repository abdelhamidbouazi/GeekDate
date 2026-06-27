using sparkdates.Application.Dtos.UserBlocks;
using sparkdates.Application.Dtos.UserLikes;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IUserLikesServiceAsync
    {
        Task<GetUserBlocksDto> GetUsersBlocksAsync();
        Task<GetUserLikesDto> GetUserLikesAsync(Guid likedUserId);
        Task<UserLikesDto> CreateUserLikesAsync(CreateUserLikesDto createUserLikesDto);
    }
}
