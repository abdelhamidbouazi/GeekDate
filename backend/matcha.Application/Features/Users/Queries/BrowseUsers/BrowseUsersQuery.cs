using matcha.Application.Dtos.Users;
using matcha.Application.Interfaces.Services;
using matcha.Application.ResponseWrappers;
using MediatR;

namespace matcha.Application.Features.Users.Queries.BrowseUsers
{
    public class BrowseUsersQuery : IRequest<Response<IEnumerable<BrowseUserDto>>>
    {
        public Guid UserId { get; set; }
    }

    public class BrowseUsersQueryHandler : IRequestHandler<BrowseUsersQuery, Response<IEnumerable<BrowseUserDto>>>
    {
        private readonly IMatchmakingServiceAsync _browseServiceAsync;

        public BrowseUsersQueryHandler(IMatchmakingServiceAsync browseServiceAsync)
        {
            _browseServiceAsync = browseServiceAsync;
        }

        public async Task<Response<IEnumerable<BrowseUserDto>>> Handle(BrowseUsersQuery request, CancellationToken cancellationToken)
        {
            var users = await _browseServiceAsync.BrowseUsersAsync(request.UserId);
            return new Response<IEnumerable<BrowseUserDto>>(users);
        }
    }
}

