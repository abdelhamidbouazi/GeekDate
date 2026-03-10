using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;

namespace matcha.Infrastructure.Repositories
{
    public class NotificationRepositoryAsync : GenericRepoAsync<Notification>, INotificationRepositoryAsync
    {
        public NotificationRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Notification> queryBuilder) : base(databaseService, queryBuilder) { }
    }
}
