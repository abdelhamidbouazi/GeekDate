using matcha.Application.Interfaces.Repositories;
using matcha.Domain.Entities;

public interface IConfirmEmailTokenRepositoryAsync : IGenericRepoAsync<ConfirmEmailToken>
{
    Task<ConfirmEmailToken> GetConfirmEmailTokenByUserId(Guid userId);
    Task UpdateAllTokensByUserId(Guid userId);
}