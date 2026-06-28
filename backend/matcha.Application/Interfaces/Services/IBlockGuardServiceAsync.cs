namespace sparkdates.Application.Interfaces.Services
{
    public interface IBlockGuardServiceAsync
    {
        Task<bool> IsBlockedBetweenUsersAsync(Guid firstUserId, Guid secondUserId);
        Task EnsureUsersCanInteractAsync(Guid firstUserId, Guid secondUserId, string? message = null);
    }
}
