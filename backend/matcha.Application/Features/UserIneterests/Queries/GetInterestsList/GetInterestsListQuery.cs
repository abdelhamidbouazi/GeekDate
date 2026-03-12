using AutoMapper;
using matcha.Application.Dtos.InterestDtos;
using matcha.Application.Interfaces.Repositories;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.UserIneterests.Queries.GetInterestsList
{
    public class GetInterestsListQuery : IRequest<Response<List<InterestDto>>>
    {

    }

    public class GetInterestsListQueryHandler : IRequestHandler<GetInterestsListQuery, Response<List<InterestDto>>>
    {
        private readonly IInterestRepositoryAsync _interestRepositoryAsync;
        private readonly IMapper _mapper;

        public GetInterestsListQueryHandler(IInterestRepositoryAsync interestRepositoryAsync, IMapper mapper)
        {
            this._interestRepositoryAsync = interestRepositoryAsync;
            this._mapper = mapper;
        }
        public async Task<Response<List<InterestDto>>> Handle(GetInterestsListQuery request, CancellationToken cancellationToken)
        {
            var interests = await _interestRepositoryAsync.GetAllAsync();
            return new Response<List<InterestDto>>(_mapper.Map<List<InterestDto>>(interests));
        }
    }
}