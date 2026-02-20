using matcha.Application.Dtos.UserBlocks;
using matcha.Application.Dtos.UserLikes;

namespace matcha.Application.Interfaces.Services
{
    public interface IUserLikesServiceAsync
    {
        Task<GetUserBlocksDto> GetUsersBlocksAsync();
        Task<GetUserLikesDto> GetUserLikesAsync(Guid likedUserId);
        Task<UserLikesDto> CreateUserLikesAsync(CreateUserLikesDto createUserLikesDto);
    }
}
