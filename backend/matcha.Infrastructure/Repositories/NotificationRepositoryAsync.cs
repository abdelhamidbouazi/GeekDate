using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;

namespace sparkdates.Infrastructure.Repositories
{
    public class NotificationRepositoryAsync : GenericRepoAsync<Notification>, INotificationRepositoryAsync
    {
        public NotificationRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Notification> queryBuilder) : base(databaseService, queryBuilder) { }
    }
}
