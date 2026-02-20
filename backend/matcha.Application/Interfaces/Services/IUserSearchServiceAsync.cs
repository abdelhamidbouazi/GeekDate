using matcha.Application.Dtos.Users;
using matcha.Application.Specifications;

namespace matcha.Application.Interfaces.Services
{
    public interface IUserSearchServiceAsync
    {
        Task<IEnumerable<BrowseUserDto>> SearchUsersAsync(Guid userId, SearchUsersSpecification searchSpec);
    }
}
