using matcha.Application.Dtos.InterestDtos;

namespace matcha.Application.Interfaces.Services
{
    public interface IInterestService
    {
        Task<IReadOnlyCollection<GetInterestsDto>> GetAllInterestsAsync();
        Task<GetInterestDto> GetInterestByIdAsync(Guid id);
        Task<InterestDto> CreateInterestAsync(CreateInterestDto createInterestDto);
        Task<bool> UpdateInterest(Guid id, UpdateInterestDto updateInterestDto);
        Task<bool> DeleteInterest(Guid id);

    }
}
