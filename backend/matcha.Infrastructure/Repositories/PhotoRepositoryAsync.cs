using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services.Database;
using matcha.Domain.Entities;
using matcha.Infrastructure.ReposUsingCustomQueryBuilder;

namespace matcha.Infrastructure.Repositories
{
    public class PhotoRepositoryAsync : GenericRepoAsync<Photo>, IPhotoRepositoryAsync
    {
        public PhotoRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Photo> queryBuilder) : base(databaseService, queryBuilder) { }
    }
}
