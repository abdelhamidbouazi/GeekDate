using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Application.Interfaces.UoW;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace sparkdates.Infrastructure.Repositories
{
    public class UserSearchPreferenceRepositoryAsync : GenericRepoAsync<UserSearchPreference>, IUserSearchPreferenceRepositoryAsync
    {
        private readonly IQueryBuilder<UserSearchPreference> _queryBuilder;
        private readonly IUnitOfWork _unitOfWork;
        public UserSearchPreferenceRepositoryAsync(IDatabaseService databaseService, IQueryBuilder<UserSearchPreference> queryBuilder, IUnitOfWork unitOfWork) : base(databaseService, queryBuilder)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<SearchPreferencesDto> GetByUserIdAsync(Guid userId)
        {
            _builder.ClearAll();

            var condition = new sparkdates.Application.Helper.Condition("UserId = @UserId",
                            new SqlParameter("@UserId", userId));

            var query = _builder.Select().Where(condition).Build();

            return await _database.QueryAndMapSingleAsync<SearchPreferencesDto>(query, condition.Parameters);
        }

        public async Task CreateDefaultUserPreferencesAsync(Guid userId)
        {
            // Skip if preferences already exist for this user
            var existing = await GetByUserIdAsync(userId);
            if (existing != null)
                return;

            var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new ArgumentException("User not found");

            var userAge = DateTime.UtcNow.Year - user.DateOfBirth.Value.Year;

            var userInterets = await _unitOfWork.GetRepository<IUserInterestsRepositoyAsync>().GetAllAsync(ui => ui.UserId == userId);

            var interestsIds = userInterets
                .Select(ui => ui.InterestId.ToString())
                .ToList();

            var interestIdsJson = interestsIds.Any()
                ? JsonSerializer.Serialize(interestsIds)
                : null;

            var defaultEntity = new UserSearchPreference
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                MinAge = Math.Max(18, userAge - 5),
                MaxAge = Math.Min(70, userAge + 5),
                MinFameRating = 0,
                MaxFameRating = user.FameRating + 30,
                MaxDistanceKm = 50,
                InterestIds = interestIdsJson
            };

            await AddAsync(defaultEntity);
        }



    }
}
