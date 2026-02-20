using matcha.Domain.Entities;

namespace matcha.Application.Interfaces.Repositories
{
    public interface IResetPasswordRepositoryAsync : IGenericRepoAsync<ResetPassword>
    {
        Task<ResetPassword> GetLastUserTokenAsync(Guid userId);
    }
}
