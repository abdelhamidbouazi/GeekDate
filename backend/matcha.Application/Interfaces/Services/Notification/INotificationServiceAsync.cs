
namespace sparkdates.Application.Interfaces.Services.Notification
{
    public interface INotificationServiceAsync
    {
        Task<IReadOnlyCollection<sparkdates.Domain.Entities.Notification>> GetAllNotificationsAsync(Guid userId);
        Task<IReadOnlyCollection<sparkdates.Domain.Entities.Notification>> GetUnreadNotifications(Guid userId);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task MarkAllAsReadAsync(Guid userId);
        Task MarkAsReadAsync(Guid userId, Guid notificationId);
        Task DeleteNotificationAsync(Guid userId, Guid notificationId);
    }
}
