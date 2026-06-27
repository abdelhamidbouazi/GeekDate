using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.ResponseWrappers;
using MediatR;

namespace sparkdates.Application.Features.Users.Queries.BrowseUsers
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

