using AutoMapper;
using sparkdates.Application.Dtos.InterestDtos;
using sparkdates.Application.Exceptions;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.UoW;
using sparkdates.Domain.Entities;

namespace sparkdates.DomainServices.Services.InterestService
{
    public class InterestService : IInterestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public InterestService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<InterestDto> CreateInterestAsync(CreateInterestDto createInterestDto)
        {
            var interest = await _unitOfWork.GetRepository<IInterestRepositoryAsync>().AddAsync(_mapper.Map<Interest>(createInterestDto));

            return _mapper.Map<InterestDto>(interest);
        }

        public async Task<bool> DeleteInterest(Guid id)
        {
            var interest = await _unitOfWork.GetRepository<IInterestRepositoryAsync>().FindAsync(id);

            if (interest == null) throw new NotFoundException();

            await _unitOfWork.GetRepository<IInterestRepositoryAsync>().Delete(interest);

            return await _unitOfWork.CompleteAsync();
        }

        public async Task<IReadOnlyCollection<GetInterestsDto>> GetAllInterestsAsync()
        {
            var interests = await _unitOfWork.GetRepository<IInterestRepositoryAsync>().GetAllAsync();

            return _mapper.Map<IReadOnlyCollection<GetInterestsDto>>(interests);
        }

        public async Task<GetInterestDto> GetInterestByIdAsync(Guid id)
        {
            var interest = await _unitOfWork.GetRepository<IInterestRepositoryAsync>().FindAsync(id);

            if (interest == null) throw new NotFoundException();

            return _mapper.Map<GetInterestDto>(interest);
        }

        public async Task<bool> UpdateInterest(Guid id, UpdateInterestDto updateInterestDto)
        {
            var interest = await _unitOfWork.GetRepository<IInterestRepositoryAsync>().FindAsync(id);

            if (interest == null) throw new NotFoundException("interest not found");

            interest.Name = updateInterestDto.Name;
            var result = await _unitOfWork.GetRepository<IInterestRepositoryAsync>().Update(interest);

            return result > 0;
        }
    }
}
