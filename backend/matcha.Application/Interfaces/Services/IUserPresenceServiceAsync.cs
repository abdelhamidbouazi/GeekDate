namespace sparkdates.Application.Interfaces.Services
{
    public interface IUserPresenceServiceAsync
    {
        Task UpdateLastActiveAsync(Guid userId);
    }
}
