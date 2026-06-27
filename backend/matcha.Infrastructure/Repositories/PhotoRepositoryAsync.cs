using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;

namespace sparkdates.Infrastructure.Repositories
{
    public class PhotoRepositoryAsync : GenericRepoAsync<Photo>, IPhotoRepositoryAsync
    {
        public PhotoRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<Photo> queryBuilder) : base(databaseService, queryBuilder) { }
    }
}
