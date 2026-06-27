
namespace sparkdates.Application.Interfaces.Services.Notification
{
    public interface INotificationServiceAsync
    {
        Task<IReadOnlyCollection<sparkdates.Domain.Entities.Notification>> GetUnreadNotifications(Guid userId);
        Task MarkAllAsReadAsync(Guid userId);
    }
}
