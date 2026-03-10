namespace matcha.Application.Interfaces.Services
{
    public interface IUserPresenceServiceAsync
    {
        Task UpdateLastActiveAsync(Guid userId);
    }
}
