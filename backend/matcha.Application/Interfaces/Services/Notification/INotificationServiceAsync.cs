
namespace matcha.Application.Interfaces.Services.Notification
{
    public interface INotificationServiceAsync
    {
        Task<IReadOnlyCollection<matcha.Domain.Entities.Notification>> GetUnreadNotifications(Guid userId);
        Task MarkAllAsReadAsync(Guid userId);
    }
}
