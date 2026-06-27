using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Specifications;

namespace sparkdates.Application.Interfaces.Services
{
    public interface IUserSearchServiceAsync
    {
        Task<IEnumerable<BrowseUserDto>> SearchUsersAsync(Guid userId, SearchUsersSpecification searchSpec);
    }
}
