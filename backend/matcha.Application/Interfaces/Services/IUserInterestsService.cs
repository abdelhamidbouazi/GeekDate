using matcha.Application.Dtos.UserInterestsDtos;

namespace matcha.Application.Interfaces.Services
{
    public interface IUserInterestsService
    {
        Task<IReadOnlyCollection<GetUserInterestsDto>> GetUserInterestsAsync(Guid userId);
        Task<GetUserInterestDto> GetUserInterestAsync(Guid id);
        Task<UserInterestDto> CreateUserInterestAsync(CreateUserInterestDto userInterestDto);

        Task<UserInterestDto> UpdateUserInterestAsync(Guid id, UpdateUserInterestDto updateUserInterestDto);
        Task<bool> Delete(Guid id);
    }
}
