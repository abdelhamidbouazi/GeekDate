using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Notification;
using matcha.Application.Interfaces.UoW;

namespace matcha.Infrastructure.Services.Notification
{
    public class NotificationServiceAsync : INotificationServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotificationServiceAsync(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<IReadOnlyCollection<Domain.Entities.Notification>> GetUnreadNotifications(Guid userId)
        {
            var repo = _unitOfWork.GetRepository<INotificationRepositoryAsync>();

            return await repo.GetAllAsync(n => n.UserId == userId && n.IsRead == false);
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
    }
}
