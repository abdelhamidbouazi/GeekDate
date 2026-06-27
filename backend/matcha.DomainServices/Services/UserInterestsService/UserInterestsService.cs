using AutoMapper;
using sparkdates.Application.Dtos.UserInterestsDtos;
using sparkdates.Application.Exceptions;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.UoW;
using sparkdates.Domain.Entities;

namespace sparkdates.DomainServices.Services.UserInterestsService
{
    public class UserInterestsService : IUserInterestsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IUserInterestsRepositoyAsync _userInterestRepositoyAsync;

        public UserInterestsService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userInterestRepositoyAsync = _unitOfWork.GetRepository<IUserInterestsRepositoyAsync>();
        }

        public async Task<UserInterestDto> CreateUserInterestAsync(CreateUserInterestDto userInterestDto)
        {
            var userinterest = new UserInterest
            {
                UserId = userInterestDto.UserId,
                InterestId = userInterestDto.InterestId
            };
            var result = await _userInterestRepositoyAsync.AddAsync(userinterest);
            if (result == null)
                throw new ApiException("User interest creation fails.");

            return _mapper.Map<UserInterestDto>(result);

        }

        public async Task<bool> Delete(Guid id)
        {
            var userInterest = await _userInterestRepositoyAsync.FindAsync(id);

            if (userInterest == null)
                throw new NotFoundException("user interest not found");

            return await _userInterestRepositoyAsync.Delete(userInterest) > 0;
        }

        public async Task<GetUserInterestDto> GetUserInterestAsync(Guid id)
        {
            var userInteret = await _userInterestRepositoyAsync.FindAsync(id);
            if (userInteret is null) throw new NotFoundException($"User interest with the given id {id} not found");

            return _mapper.Map<GetUserInterestDto>(userInteret);
        }

        public async Task<IReadOnlyCollection<GetUserInterestsDto>> GetUserInterestsAsync(Guid userId)
        {
            return _mapper.Map<IReadOnlyCollection<GetUserInterestsDto>>(await _userInterestRepositoyAsync
                     .GetUserInterestsByUserIdAsync(userId));
        }


        public async Task<UserInterestDto> UpdateUserInterestAsync(Guid id, UpdateUserInterestDto updateUserInterestDto)
        {
            //var userInterest = await _userInterestRepositoyAsync.FindAsync(id);

            //if (userInterest == null)
            //    throw new NotFoundException($"User interest with the given id {id} not found");

            //await _userInterestRepositoyAsync.Delete(userInterest);

            //var newUserInterest = new UserInterest()
            //{
            //    UserId = updateUserInterestDto.UserId,

            //}
            //await _userInterestRepositoyAsync.AddAsync(_mapper.Map(updateUserInterestDto, userInterests));

            //if (await _unitOfWork.CompleteAsync() is false)
            //    throw new ApiException("Update operation failed.");

            //return _mapper.Map<UserInterestDto>(userInterests);
            return null;
        }
    }
}
