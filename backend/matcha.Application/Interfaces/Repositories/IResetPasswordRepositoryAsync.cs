using sparkdates.Domain.Entities;

namespace sparkdates.Application.Interfaces.Repositories
{
    public interface IResetPasswordRepositoryAsync : IGenericRepoAsync<ResetPassword>
    {
        Task<ResetPassword> GetLastUserTokenAsync(Guid userId);
    }
}
