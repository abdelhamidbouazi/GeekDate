using sparkdates.Application.Exceptions;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Notification;
using sparkdates.Application.Interfaces.UoW;

namespace sparkdates.Infrastructure.Services.Notification
{
    public class NotificationServiceAsync : INotificationServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotificationServiceAsync(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IReadOnlyCollection<Domain.Entities.Notification>> GetAllNotificationsAsync(Guid userId)
        {
            var repo = _unitOfWork.GetRepository<INotificationRepositoryAsync>();
            var all = await repo.GetAllAsync(n => n.UserId == userId);
            return all.OrderByDescending(n => n.CreatedAt).ToList();
        }

        public async Task<IReadOnlyCollection<Domain.Entities.Notification>> GetUnreadNotifications(Guid userId)
        {
            var repo = _unitOfWork.GetRepository<INotificationRepositoryAsync>();
            var unread = await repo.GetAllAsync(n => n.UserId == userId && n.IsRead == false);
            return unread.OrderByDescending(n => n.CreatedAt).ToList();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            var repo = _unitOfWork.GetRepository<INotificationRepositoryAsync>();
            var unread = await repo.GetAllAsync(n => n.UserId == userId && n.IsRead == false);
            return unread.Count;
        }

        public async Task MarkAllAsReadAsync(Guid userId)
        {
            var repo = _unitOfWork.GetRepository<INotificationRepositoryAsync>();
            var unreadNotifications = await repo.GetAllAsync(n => n.UserId == userId && n.IsRead == false);
            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                await repo.Update(notification);
            }
        }

        public async Task MarkAsReadAsync(Guid userId, Guid notificationId)
        {
            var repo = _unitOfWork.GetRepository<INotificationRepositoryAsync>();
            var notification = await repo.FindAsync(notificationId);
            if (notification == null || notification.UserId != userId)
                throw new NotFoundException("Notification not found");
            if (notification.IsRead) return;
            notification.IsRead = true;
            await repo.Update(notification);
        }

        public async Task DeleteNotificationAsync(Guid userId, Guid notificationId)
        {
            var repo = _unitOfWork.GetRepository<INotificationRepositoryAsync>();
            var notification = await repo.FindAsync(notificationId);
            if (notification == null || notification.UserId != userId)
                throw new NotFoundException("Notification not found");
            await repo.Delete(notification);
        }
    }
}
