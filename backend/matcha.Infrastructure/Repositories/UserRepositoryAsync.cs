using AutoMapper;
using sparkdates.Application.Dtos.Users;
using sparkdates.Application.Helper;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services.Database;
using sparkdates.Application.Interfaces.UoW;
using sparkdates.Application.Specifications;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.Helpers;
using sparkdates.Infrastructure.ReposUsingCustomQueryBuilder;
using Microsoft.Data.SqlClient;

namespace sparkdates.Infrastructure.Repositories
{
    public class UserRepositoryAsync : GenericRepoAsync<AppUser>, IUserRepositoryAsync
    {
        private readonly IQueryBuilder<Interest> _interestBuilder;
        private readonly IMapper _mapper;
        private readonly SqlExpressionVisitor<Interest> _interestExpression;
        private readonly IUnitOfWork _unitOfWork;

        public UserRepositoryAsync(IDatabaseService databaseService,
            IQueryBuilder<AppUser> queryBuilder,
            IQueryBuilder<Interest> interestBuilder,
            IUnitOfWork unitOfWork
            , IMapper mapper) : base(databaseService, queryBuilder)
        {
            this._interestBuilder = interestBuilder;
            this._mapper = mapper;
            _interestExpression = new SqlExpressionVisitor<Interest>();
            _unitOfWork = unitOfWork;
        }

        public async Task<AppUser> GetUserProfile(Guid id)
        {
            var query = _builder
                .LeftJoin<AppUser, UserInterest>("id", "userId", true)
                .Where(new Condition($"{nameof(AppUser)}s.Id=@id", new SqlParameter("@id", id)))
                .SelectAll()
                .Build();

            var mapper = async (SqlDataReader reader) =>
            {
                var entityMapper = new ParentChildEntityMapper<AppUser, UserInterest, Guid>(reader, true)
                {
                    MapChildToParent = (parent, child) =>
                    {
                        if (parent.Interests == null) parent.Interests = new List<UserInterest>();
                        if (child != null)
                            parent.Interests.Add(child);
                    },
                    MapKey = parent => parent.Id
                };
                var user = await entityMapper.MapParentWithChilds(reader);
                return user;
            };

            var user = await _database.QueryAndMapSingleAsync<AppUser>(query, _builder.GetParameters(), mapper);
            await MapInterestsByIdsAsync(user);
            return user;
        }

        private async Task MapInterestsByIdsAsync(AppUser user)
        {
            var userInterestsIds = user.Interests?.Select(x => x.InterestId).Distinct().ToList() ?? new List<Guid>();
            if (userInterestsIds.Any())
            {
                //Expression<Func<Interest, bool>> predicate = (Interest interest) => userInterestsIds.Contains(interest.Id);
                var sqlParams = new List<SqlParameter>();
                var paramIndex = 0;
                var where = "";
                foreach (var id in userInterestsIds)
                {
                    sqlParams.Add(new($"@id{paramIndex}", id));
                    if (where != "")
                        where += " OR ";
                    where += $"Id=@id{paramIndex++}";
                }

                //var condition = new Condition(_interestExpression.GetWhereClause(predicate), _interestBuilder.GetParameters());
                //var query = _interestBuilder.Select()
                //.Where(condition)
                //    .Build();
                //var condition = new Condition(where, sqlParams.ToArray());
                //var query = _interestBuilder
                //    .Where(condition)
                //    .SelectAll()
                //    .Build();
                var interests = await _database.QueryAndMapAsync<Interest>($"SELECT * FROM {nameof(Interest)}s WHERE {where}", sqlParams.ToArray());
                foreach (var userInterest in user.Interests)
                {
                    userInterest.Interest = interests.FirstOrDefault(x => x.Id == userInterest.InterestId);
                }
            }
        }

        public async Task<AppUser> GetUserWithPhotosById(Guid id)
        {
            _builder.ClearAll();
            var condition = new Condition($"{nameof(AppUser)}s.Id=@id", new SqlParameter("@id", id));
            var query = _builder
                .LeftJoin<AppUser, Photo>("id", "userId", true)
                .Where(condition)
                .SelectAll()
                .Build();

            var user = await _database.QueryAndMapSingleAsync<AppUser>(query, condition.Parameters, MapToAppUserObject);
            return user;
        }

        public async Task<AppUser?> GetUserWithPhotosByUserNameAsync(string userName)
        {
            _builder.ClearAll();
            var condition = new Condition($"{nameof(AppUser)}s.{nameof(AppUser.UserName)}=@username", new SqlParameter("@username", userName));
            var query = _builder
                .LeftJoin<AppUser, Photo>("id", "userId", true)
                .Where(condition)
                .SelectAll()
                .Build();

            var user = await _database.QueryAndMapSingleAsync<AppUser>(query, condition.Parameters, MapToAppUserObject);
            return user;
        }

        private async Task<AppUser> MapToAppUserObject(SqlDataReader reader)
        {
            // This method will map the columns that are selected from the sql database, those columns are currently exist in SqlDataReader object, those columns will be mapped to the AppUser object and its child Photo objects.
            var entityMapper = new ParentChildEntityMapper<AppUser, Photo, Guid>(reader, true)
            {
                MapChildToParent = (parent, child) =>
                {
                    if (parent.Photos == null) parent.Photos = new List<Photo>();
                    if (child is not null) parent.Photos.Add(child);
                },
                MapKey = parent => parent.Id
            };
            var user = await entityMapper.MapParentWithChilds(reader);
            return user;
        }

        public async Task<IEnumerable<AppUser>> GetProfileViewersAsync(Guid id)
        {
            var query = _builder
                .InnerJoin<AppUser, ProfileView>(nameof(AppUser.Id), nameof(ProfileView.FromUserId))
                .LeftJoin<AppUser, Photo>(nameof(AppUser.Id), nameof(Photo.UserId), true)
                .Where(new Condition($"{nameof(ProfileView)}s.{nameof(ProfileView.TargetUserId)}=@id", new SqlParameter("@id", id)))
                .SelectAll()
                .Build();

            var users = await _database.QueryAndMapCollectionAsync<AppUser>(query, _builder.GetParameters(), MapToAppUserObject);
            return users;
        }

        public async Task<IEnumerable<AppUser>> GetprofileLikesAsync(Guid userId)
        {
            var query = _builder
             .InnerJoin<AppUser, UserLike>(nameof(AppUser.Id), nameof(UserLike.LikerUserId))
             .LeftJoin<AppUser, Photo>(nameof(AppUser.Id), nameof(Photo.UserId), true)
             .Where(new Condition($"{nameof(UserLike)}s.{nameof(UserLike.LikedUserId)}=@id", new SqlParameter("@id", userId)))
             .SelectAll()
             .Build();

            var users = await _database.QueryAndMapCollectionAsync<AppUser>(query, _builder.GetParameters(), MapToAppUserObject);
            return users;
        }

        public async Task<AppUser> GetUserWithInterestsByIdAsync(Guid id)
        {
            _builder.ClearAll();

            var query = _builder.LeftJoin<AppUser, UserInterest>(nameof(AppUser.Id), nameof(UserInterest.UserId), true)
                .Where(new Condition($"{nameof(AppUser)}s.{nameof(AppUser.Id)}=@id", new SqlParameter("@id", id)))
                .SelectAll()
                .Build();

            return await _database.QueryAndMapSingleAsync<AppUser>(query, _builder.GetParameters(), async (reader) =>
            {
                var entityMapper = new ParentChildEntityMapper<AppUser, UserInterest, Guid>(reader, true)
                {
                    MapChildToParent = (parent, child) =>
                    {
                        if (parent.Interests == null) parent.Interests = new List<UserInterest>();
                        if (child != null)
                            parent.Interests.Add(child);
                    },
                    MapKey = parent => parent.Id
                };
                var user = await entityMapper.MapParentWithChilds(reader);
                await MapInterestsByIdsAsync(user);
                return user;
            });
        }
        public (string SqlQuery, SqlParameter[] Parameters) BuildGetMatchingUsersQuery(BrowseUsersSpecification spec)
        {
            // This method can be used to build the SQL query and parameters for getting matching users.

            //Build gender conditions
            var genderCondition = string.Join(" OR ",
                spec.PreferredGenders.Select((g, i) => $"u.Gender = @gender{i}"));

            var interestJoin = spec.UserInterestIds?.Any() == true
                ? "INNER JOIN UserInterests ui ON ui.UserId = u.Id"
                : "LEFT JOIN UserInterests ui ON ui.UserId = u.Id";

            var interestCondition = spec.UserInterestIds?.Any() == true
                ? $"AND ui.InterestId IN ({string.Join(",", spec.UserInterestIds.Select((_, i) => $"@interest{i}"))})"
                : "";

            var excludeViewedClause = "";
            if (spec.ExcludedUserIds?.Any() == true)
            {
                var excludeParams = string.Join(",", spec.ExcludedUserIds.Select((_, i) => $"@excludedId{i}"));
                excludeViewedClause = $"AND u.Id NOT IN ({excludeParams})";
            }

            var query = $@"
            SELECT DISTINCT
                u.Id,
                u.FirstName,
                u.LastName,
                u.FameRating,
                u.PhotoProfileUrl,
                u.DateOfBirth,

                -- Distance
                CASE 
                    WHEN u.Latitude IS NOT NULL AND u.Longitude IS NOT NULL 
                         AND @userLat != 0 AND @userLon != 0
                    THEN GEOGRAPHY::Point(@userLat, @userLon, 4326)
                        .STDistance(GEOGRAPHY::Point(u.Latitude, u.Longitude, 4326))
                    ELSE 999999999
                END AS DistanceInMeters,

                -- Age
                DATEDIFF(YEAR, u.DateOfBirth, GETDATE()) AS Age,

                -- Interests of the user
                STRING_AGG(CAST(ui.InterestId AS NVARCHAR(36)), ',') AS InterestIds,

                -- Common tags
                (
                    SELECT COUNT(*)
                    FROM UserInterests ui2
                    WHERE ui2.UserId = u.Id
                      AND ui2.InterestId IN (
                          SELECT InterestId FROM UserInterests WHERE UserId = @excludeUserId
                      )
                ) AS CommonTagsCount

            FROM AppUsers u
            {interestJoin}
            WHERE u.Id != @excludeUserId
                {excludeViewedClause}

                -- Exclude users I block
                AND u.Id NOT IN (
                    SELECT BlockedUserId FROM UserBlocks WHERE BlockingUserId = @excludeUserId
                )

                -- Exclude users who blocked me
                AND u.Id NOT IN (
                    SELECT BlockingUserId FROM UserBlocks WHERE BlockedUserId = @excludeUserId
                )

                -- Exclude users I already liked
                AND u.Id NOT IN (
                    SELECT LikedUserId FROM UserLikes WHERE LikerUserId = @excludeUserId
                )

                -- Exclude users already matched with me
                AND u.Id NOT IN (
                    SELECT CASE
                        WHEN User1Id = @excludeUserId THEN User2Id
                        ELSE User1Id
                    END
                    FROM Matches
                    WHERE User1Id = @excludeUserId OR User2Id = @excludeUserId
                )

                AND ({genderCondition})
                AND u.FameRating BETWEEN @minFame AND @maxFame
                AND (DATEDIFF(YEAR, u.DateOfBirth, GETDATE()) BETWEEN @minAge AND @maxAge)
                {interestCondition}

            GROUP BY 
                u.Id, u.FirstName, u.LastName, u.FameRating, 
                u.PhotoProfileUrl, u.DateOfBirth, u.Latitude, u.Longitude

            HAVING (
                CASE 
                    WHEN u.Latitude IS NOT NULL AND u.Longitude IS NOT NULL 
                         AND @userLat != 0 AND @userLon != 0
                    THEN GEOGRAPHY::Point(@userLat, @userLon, 4326)
                        .STDistance(GEOGRAPHY::Point(u.Latitude, u.Longitude, 4326))
                    ELSE 999999999
                END
            ) <= @maxDistance

            ORDER BY 
                DistanceInMeters ASC,
                Age DESC,
                CommonTagsCount DESC,
                FameRating DESC;";

            var parameters = new List<SqlParameter>
            {
                new("@excludeUserId", spec.ExcludeUserId),
                new("@minFame", spec.MinFameRating ?? 0),
                new("@maxFame", spec.MaxFameRating ?? int.MaxValue),
                new("@userLat", spec.UserLatitude),
                new("@userLon", spec.UserLongitude),
                new("@maxDistance", spec.MaxDistanceMeters),
                new("@minAge", spec.MinAge ?? 18),
                new("@maxAge", spec.MaxAge ?? 100)
            };

            // Add all gender parameters
            for (int i = 0; i < spec.PreferredGenders.Count; i++)
            {
                parameters.Add(new SqlParameter($"@gender{i}", (int)spec.PreferredGenders[i]));
            }

            // Add all interest parameters
            if (spec.UserInterestIds?.Any() == true)
            {
                for (int i = 0; i < spec.UserInterestIds.Count; i++)
                {
                    parameters.Add(new SqlParameter($"@interest{i}", spec.UserInterestIds[i]));
                }
            }

            return (query, parameters.ToArray());
        }
        public async Task<IEnumerable<BrowseUserDto>> GetMatchingUsersAsync(BrowseUsersSpecification spec)
        {
            var (SqlQuery, Parameters) = BuildGetMatchingUsersQuery(spec);

            return await _database.QueryAndMapCollectionAsync(
                SqlQuery,
                Parameters,
                async (reader) => await Task.FromResult(ReadBrowseUserDto(reader)));
        }

        private BrowseUserDto ReadBrowseUserDto(SqlDataReader reader)
        {
            var browseUser = new BrowseUserDto
            {
                Id = reader.GetGuid(0),
                FirstName = reader.GetString(1),
                LastName = reader.GetString(2),
                FameRating = reader.GetInt32(3),
                ProfilePicture = reader.IsDBNull(4) ? null : reader.GetString(4),
                DistanceInMeters = reader.GetDouble(6)
            };

            if (!reader.IsDBNull(5))
            {
                var dob = reader.GetDateTime(5);
                browseUser.Age = DateTime.UtcNow.Year - dob.Year;
                if (dob.Date > DateTime.UtcNow.AddYears(-browseUser.Age.Value))
                    browseUser.Age--;
            }

            if (!reader.IsDBNull(8))
            {
                var interestIdsString = reader.GetString(8);
                browseUser.InterestIds = interestIdsString
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(Guid.Parse)
                    .ToList();
            }

            browseUser.CommonTagsCount = reader.IsDBNull(9) ? 0 : reader.GetInt32(9);

            return browseUser;
        }

        public async Task<IEnumerable<BrowseUserDto>> SearchUsersAsync(SearchUsersSpecification spec)
        {
            var (sqlQuery, parameters) = await BuildSearchUsersQuery(spec);

            return await _database.QueryAndMapCollectionAsync(
                sqlQuery,
                parameters,
                async (reader) => await Task.FromResult(ReadBrowseUserDto(reader)));
        }

        private async Task<(string SqlQuery, SqlParameter[] Parameters)> BuildSearchUsersQuery(SearchUsersSpecification spec)
        {
            // Build gender conditions
            var genderCondition = string.Join(" OR ",
                spec.PreferredGenders.Select((g, i) => $"u.Gender = @gender{i}"));

            // Interest join - if user specified required interests, use INNER JOIN
            var interestJoin = spec.RequiredInterestIds?.Any() == true
                ? "INNER JOIN UserInterests ui ON ui.UserId = u.Id"
                : "LEFT JOIN UserInterests ui ON ui.UserId = u.Id";

            var interestCondition = spec.RequiredInterestIds?.Any() == true
                ? $"AND ui.InterestId IN ({string.Join(",", spec.RequiredInterestIds.Select((_, i) => $"@interest{i}"))})"
                : "";

            // Distance filter - only apply if user specified location criteria
            string distanceFilter = "";
            if (spec.MaxDistanceMeters.HasValue && spec.UserLatitude.HasValue && spec.UserLongitude.HasValue)
            {
                distanceFilter = @"
    AND (
        u.Latitude IS NOT NULL
        AND u.Longitude IS NOT NULL
        AND GEOGRAPHY::Point(@userLat, @userLon, 4326)
            .STDistance(GEOGRAPHY::Point(u.Latitude, u.Longitude, 4326))
            <= @maxDistance
    )";
            }

            // Build ORDER BY clause based on sort specification
            var orderByClause = spec.SortBy switch
            {
                SearchSortBy.Age => "Age",
                SearchSortBy.Distance => "DistanceInMeters",
                SearchSortBy.FameRating => "FameRating",
                SearchSortBy.CommonTags => "CommonTagsCount",
                _ => "DistanceInMeters"
            };

            var sortDirection = spec.SortDescending ? "DESC" : "ASC";

            var query = $@"SELECT 
                u.Id,
                u.FirstName,
                u.LastName,
                u.FameRating,
                u.PhotoProfileUrl,
                u.DateOfBirth,
    
                -- Distance
                CASE 
                    WHEN u.Latitude IS NOT NULL 
                     AND u.Longitude IS NOT NULL
                     AND @userLat IS NOT NULL 
                     AND @userLon IS NOT NULL
                    THEN GEOGRAPHY::Point(@userLat, @userLon, 4326)
                        .STDistance(GEOGRAPHY::Point(u.Latitude, u.Longitude, 4326))
                    ELSE 999999999
                END AS DistanceInMeters,
    
                -- Age
                DATEDIFF(YEAR, u.DateOfBirth, GETDATE()) AS Age,

                -- 🔴 THIS IS WHAT WAS MISSING
                CAST(NULL AS NVARCHAR(200)) AS InterestIds,

                -- Common tags
                (
                    SELECT COUNT(*)
                    FROM UserInterests ui2
                    WHERE ui2.UserId = u.Id
                      AND ui2.InterestId IN (
                          SELECT InterestId 
                          FROM UserInterests 
                          WHERE UserId = @excludeUserId
                      )
                ) AS CommonTagsCount

            FROM AppUsers u

            WHERE u.Id != @excludeUserId
                AND u.Id NOT IN (SELECT BlockedUserId FROM UserBlocks WHERE BlockingUserId = @excludeUserId)
                AND u.Id NOT IN (SELECT BlockingUserId FROM UserBlocks WHERE BlockedUserId = @excludeUserId)
                AND u.Id NOT IN (SELECT LikedUserId FROM UserLikes WHERE LikerUserId = @excludeUserId)
                AND u.Id NOT IN (
                    SELECT CASE
                        WHEN User1Id = @excludeUserId THEN User2Id
                        ELSE User1Id
                    END
                    FROM Matches
                    WHERE User1Id = @excludeUserId OR User2Id = @excludeUserId
                )
                AND ({genderCondition})
                AND DATEDIFF(YEAR, u.DateOfBirth, GETDATE()) BETWEEN @minAge AND @maxAge
                AND u.FameRating BETWEEN @minFame AND @maxFame
                {distanceFilter}

            ORDER BY {orderByClause} {sortDirection};
            ";

            var parameters = new List<SqlParameter>
            {
                new("@excludeUserId", spec.ExcludeUserId),
                new("@minFame", spec.MinFameRating ?? 0),
                new("@maxFame", spec.MaxFameRating ?? int.MaxValue),
                new("@minAge", spec.MinAge ?? 18),
                new("@maxAge", spec.MaxAge ?? 100)
            };

            // Add location parameters (nullable)
            if (spec.UserLatitude.HasValue && spec.UserLongitude.HasValue)
            {
                parameters.Add(new SqlParameter("@userLat", spec.UserLatitude.Value));
                parameters.Add(new SqlParameter("@userLon", spec.UserLongitude.Value));
                parameters.Add(new SqlParameter("@maxDistance", spec.MaxDistanceMeters ?? double.MaxValue));

            }
            else
            {
                // Pass NULL values if location not specified
                parameters.Add(new SqlParameter("@userLat", DBNull.Value));
                parameters.Add(new SqlParameter("@userLon", DBNull.Value));
                parameters.Add(new SqlParameter("@maxDistance", double.MaxValue));
            }

            // Add all gender parameters
            for (int i = 0; i < spec.PreferredGenders.Count; i++)
            {
                parameters.Add(new SqlParameter($"@gender{i}", (int)spec.PreferredGenders[i]));
            }

            // Add all interest parameters (if specified)
            if (spec.RequiredInterestIds?.Any() == true)
            {
                for (int i = 0; i < spec.RequiredInterestIds.Count; i++)
                {
                    parameters.Add(new SqlParameter($"@interest{i}", spec.RequiredInterestIds[i]));
                }
            }

            return (query, parameters.ToArray());
        }
    }
}
