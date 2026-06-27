using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Domain.Entities;

public interface IConfirmEmailTokenRepositoryAsync : IGenericRepoAsync<ConfirmEmailToken>
{
    Task<ConfirmEmailToken> GetConfirmEmailTokenByUserId(Guid userId);
    Task UpdateAllTokensByUserId(Guid userId);
}