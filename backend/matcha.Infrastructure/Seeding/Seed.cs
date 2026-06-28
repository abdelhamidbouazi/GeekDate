using Bogus;
using sparkdates.Domain.Common.Enums;
using sparkdates.Domain.Entities;
using sparkdates.Infrastructure.ApplicationDbContext;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace sparkdates.Infrastructure.Seeding
{
    public class Seed
    {
        private readonly AppDbContext _context;
        private readonly Random _rand = new(42);

        // Seed users are identified by this email domain so they can be cleaned up.
        private const string SeedEmailDomain = "@seeddata.local";
        private const string SeedUsernamePrefix = "seed_";

        private static readonly (string City, string Country, double Lat, double Lng)[] WorldCities =
        [
            // Africa
            ("Casablanca", "Morocco", 33.5731, -7.5898),
            ("Marrakech", "Morocco", 31.6295, -7.9811),
            ("Fes", "Morocco", 34.0331, -5.0003),
            ("Cairo", "Egypt", 30.0444, 31.2357),
            ("Alexandria", "Egypt", 31.2001, 29.9187),
            ("Lagos", "Nigeria", 6.5244, 3.3792),
            ("Nairobi", "Kenya", -1.2921, 36.8219),
            ("Cape Town", "South Africa", -33.9249, 18.4241),
            ("Johannesburg", "South Africa", -26.2041, 28.0473),
            ("Tunis", "Tunisia", 36.8065, 10.1815),
            ("Dakar", "Senegal", 14.6937, -17.4441),
            ("Algiers", "Algeria", 36.7538, 3.0588),
            ("Accra", "Ghana", 5.6037, -0.1870),
            ("Addis Ababa", "Ethiopia", 9.0320, 38.7469),
            ("Abidjan", "Ivory Coast", 5.3600, -4.0083),
            // Europe
            ("Paris", "France", 48.8566, 2.3522),
            ("Lyon", "France", 45.7640, 4.8357),
            ("London", "United Kingdom", 51.5074, -0.1278),
            ("Manchester", "United Kingdom", 53.4808, -2.2426),
            ("Madrid", "Spain", 40.4168, -3.7038),
            ("Barcelona", "Spain", 41.3851, 2.1734),
            ("Rome", "Italy", 41.9028, 12.4964),
            ("Milan", "Italy", 45.4654, 9.1859),
            ("Berlin", "Germany", 52.5200, 13.4050),
            ("Munich", "Germany", 48.1351, 11.5820),
            ("Amsterdam", "Netherlands", 52.3676, 4.9041),
            ("Brussels", "Belgium", 50.8503, 4.3517),
            ("Lisbon", "Portugal", 38.7223, -9.1393),
            ("Vienna", "Austria", 48.2082, 16.3738),
            ("Stockholm", "Sweden", 59.3293, 18.0686),
            ("Oslo", "Norway", 59.9139, 10.7522),
            ("Copenhagen", "Denmark", 55.6761, 12.5683),
            ("Warsaw", "Poland", 52.2297, 21.0122),
            ("Prague", "Czech Republic", 50.0755, 14.4378),
            ("Budapest", "Hungary", 47.4979, 19.0402),
            ("Athens", "Greece", 37.9838, 23.7275),
            ("Zurich", "Switzerland", 47.3769, 8.5417),
            ("Helsinki", "Finland", 60.1699, 24.9384),
            ("Bucharest", "Romania", 44.4268, 26.1025),
            ("Sofia", "Bulgaria", 42.6977, 23.3219),
            // Americas
            ("New York", "United States", 40.7128, -74.0060),
            ("Los Angeles", "United States", 34.0522, -118.2437),
            ("Chicago", "United States", 41.8781, -87.6298),
            ("Houston", "United States", 29.7604, -95.3698),
            ("Miami", "United States", 25.7617, -80.1918),
            ("San Francisco", "United States", 37.7749, -122.4194),
            ("Toronto", "Canada", 43.6532, -79.3832),
            ("Montreal", "Canada", 45.5017, -73.5673),
            ("Vancouver", "Canada", 49.2827, -123.1207),
            ("Mexico City", "Mexico", 19.4326, -99.1332),
            ("São Paulo", "Brazil", -23.5505, -46.6333),
            ("Rio de Janeiro", "Brazil", -22.9068, -43.1729),
            ("Buenos Aires", "Argentina", -34.6037, -58.3816),
            ("Bogotá", "Colombia", 4.7110, -74.0721),
            ("Lima", "Peru", -12.0464, -77.0428),
            ("Santiago", "Chile", -33.4489, -70.6693),
            ("Medellín", "Colombia", 6.2442, -75.5812),
            // Asia
            ("Tokyo", "Japan", 35.6762, 139.6503),
            ("Osaka", "Japan", 34.6937, 135.5023),
            ("Beijing", "China", 39.9042, 116.4074),
            ("Shanghai", "China", 31.2304, 121.4737),
            ("Shenzhen", "China", 22.5431, 114.0579),
            ("Mumbai", "India", 19.0760, 72.8777),
            ("Delhi", "India", 28.7041, 77.1025),
            ("Bangalore", "India", 12.9716, 77.5946),
            ("Seoul", "South Korea", 37.5665, 126.9780),
            ("Bangkok", "Thailand", 13.7563, 100.5018),
            ("Singapore", "Singapore", 1.3521, 103.8198),
            ("Dubai", "United Arab Emirates", 25.2048, 55.2708),
            ("Abu Dhabi", "United Arab Emirates", 24.4539, 54.3773),
            ("Istanbul", "Turkey", 41.0082, 28.9784),
            ("Ankara", "Turkey", 39.9334, 32.8597),
            ("Jakarta", "Indonesia", -6.2088, 106.8456),
            ("Kuala Lumpur", "Malaysia", 3.1390, 101.6869),
            ("Ho Chi Minh City", "Vietnam", 10.8231, 106.6297),
            ("Hanoi", "Vietnam", 21.0285, 105.8542),
            ("Riyadh", "Saudi Arabia", 24.6877, 46.7219),
            ("Karachi", "Pakistan", 24.8607, 67.0011),
            ("Dhaka", "Bangladesh", 23.8103, 90.4125),
            ("Manila", "Philippines", 14.5995, 120.9842),
            ("Taipei", "Taiwan", 25.0330, 121.5654),
            ("Tel Aviv", "Israel", 32.0853, 34.7818),
            ("Tehran", "Iran", 35.6892, 51.3890),
            // Oceania
            ("Sydney", "Australia", -33.8688, 151.2093),
            ("Melbourne", "Australia", -37.8136, 144.9631),
            ("Brisbane", "Australia", -27.4698, 153.0251),
            ("Auckland", "New Zealand", -36.8485, 174.7633),
        ];

        private static readonly string[] BioTemplates =
        [
            "Passionate about {0} and {1}. Always up for a good {2}.",
            "Life is too short to not explore. Love {0}, {1}, and meeting new people.",
            "{0} enthusiast by day, {1} lover by night. Looking for genuine connections.",
            "I believe in {0} and {1}. Let's grab coffee and see where things go.",
            "Fan of {0} and all things {1}. Down for spontaneous adventures.",
            "Work hard, {0} harder. Weekends are for {1} and good company.",
            "Obsessed with {0}. If you love {1} too, we'll get along great.",
            "Living my best life through {0} and {1}. Swipe right if you enjoy good conversations.",
            "Simple person with a passion for {0}. Also really into {1}.",
            "Just someone who enjoys {0}, {1}, and meaningful moments.",
            "Amateur {0} aficionado. Professional {1} enthusiast. Human above all.",
            "Trying to balance {0} and real life. {1} keeps me grounded.",
            "My ideal day: {0} in the morning, {1} in the evening.",
            "I geek out over {0}. My friends drag me to {1} events.",
            "Not sure what I'm doing with my life but {0} and {1} make it worth it.",
        ];

        private static readonly string[] BioNouns =
        [
            "travel", "hiking", "music", "cooking", "photography", "reading", "gaming",
            "yoga", "cycling", "surfing", "dancing", "coffee", "art", "cinema",
            "fitness", "technology", "nature", "food", "wine", "meditation",
            "basketball", "football", "tennis", "swimming", "running", "climbing",
            "drawing", "writing", "podcasts", "anime", "startups", "design",
            "philosophy", "history", "science", "volunteering", "languages", "chess",
        ];

        private static readonly (string Locale, Bogus.DataSets.Name.Gender Male, Bogus.DataSets.Name.Gender Female)[] NameLocales =
        [
            ("en", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("fr", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("es", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("de", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("it", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("pt_BR", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("nl", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("pl", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("tr", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("ru", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("ar", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
            ("ja", Bogus.DataSets.Name.Gender.Male, Bogus.DataSets.Name.Gender.Female),
        ];

        public Seed(AppDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            if (await _context.AppUsers.AnyAsync(u => u.UserName.StartsWith(SeedUsernamePrefix)))
                return;

            var interests = await EnsureInterestsAsync();
            await SeedUsersAsync(interests, count: 600);
        }

        // Force re-seed: remove existing seed data first, then re-seed.
        public async Task ForceSeedAsync()
        {
            await RemoveSeedAsync();
            var interests = await EnsureInterestsAsync();
            await SeedUsersAsync(interests, count: 600);
        }

        public async Task RemoveSeedAsync()
        {
            var seedUsers = await _context.AppUsers
                .Where(u => u.UserName.StartsWith(SeedUsernamePrefix))
                .ToListAsync();

            if (seedUsers.Count == 0)
                return;

            var seedUserIds = seedUsers.Select(u => u.Id).ToList();

            var interests = await _context.UserInterests
                .Where(ui => seedUserIds.Contains(ui.UserId))
                .ToListAsync();
            _context.UserInterests.RemoveRange(interests);

            var photos = await _context.Photos
                .Where(p => seedUserIds.Contains(p.UserId))
                .ToListAsync();
            _context.Photos.RemoveRange(photos);

            _context.AppUsers.RemoveRange(seedUsers);
            await _context.SaveChangesAsync();
        }

        private async Task<List<Interest>> EnsureInterestsAsync()
        {
            var existing = await _context.Interests.ToListAsync();
            if (existing.Count > 0)
                return existing;

            var baseInterests = new List<string>
            {
                "Music", "Sports", "Travel", "Movies", "Coding",
                "Fitness", "Books", "Gaming", "Cooking", "Photography",
                "Art", "Hiking", "Yoga", "Dancing", "Cycling",
                "Reading", "Writing", "Fashion", "Volunteering", "Meditation"
            };

            var interests = baseInterests.Select(i => new Interest { Name = i }).ToList();
            await _context.Interests.AddRangeAsync(interests);
            await _context.SaveChangesAsync();
            return interests;
        }

        private async Task SeedUsersAsync(List<Interest> allInterests, int count)
        {
            using var hmac = new System.Security.Cryptography.HMACSHA512();
            var users = new List<AppUser>();
            var fakers = NameLocales.Select(nl => new Faker(nl.Locale)).ToArray();

            for (int i = 0; i < count; i++)
            {
                var gender = i % 2 == 0 ? Gender.Male : Gender.Female;
                var fakerIndex = i % fakers.Length;
                var faker = fakers[fakerIndex];
                var (localeCode, _, _) = NameLocales[fakerIndex];

                var bogusGender = gender == Gender.Male
                    ? Bogus.DataSets.Name.Gender.Male
                    : Bogus.DataSets.Name.Gender.Female;

                var firstName = faker.Name.FirstName(bogusGender);
                var lastName = faker.Name.LastName();
                var userName = $"{SeedUsernamePrefix}{i + 1}";
                var email = $"{userName}{SeedEmailDomain}";

                var location = WorldCities[i % WorldCities.Length];
                var latJitter = (_rand.NextDouble() - 0.5) * 0.15;
                var lngJitter = (_rand.NextDouble() - 0.5) * 0.15;

                var sexPref = (SexualPreferences)(_rand.Next(1, 3)); // Male or Female
                var relationshipGoal = (RelationshipGoals)(_rand.Next(1, 6));
                var fameRating = _rand.Next(0, 101);
                var dob = faker.Date.Between(DateTime.UtcNow.AddYears(-45), DateTime.UtcNow.AddYears(-18));
                var createdAt = faker.Date.Between(DateTime.UtcNow.AddYears(-2), DateTime.UtcNow.AddDays(-1));
                var lastActive = faker.Date.Between(createdAt, DateTime.UtcNow);

                var noun1 = BioNouns[_rand.Next(BioNouns.Length)];
                string noun2;
                do { noun2 = BioNouns[_rand.Next(BioNouns.Length)]; } while (noun2 == noun1);
                var noun3 = faker.Hacker.Verb();
                var bioTemplate = BioTemplates[_rand.Next(BioTemplates.Length)];
                var bio = string.Format(bioTemplate, noun1, noun2, noun3);

                var photoIndex = i % 100;
                var photoGender = gender == Gender.Male ? "men" : "women";
                var photoUrl = $"https://randomuser.me/api/portraits/{photoGender}/{photoIndex}.jpg";

                using var hmacInner = new System.Security.Cryptography.HMACSHA512();
                var user = new AppUser
                {
                    FirstName = firstName,
                    LastName = lastName,
                    UserName = userName,
                    Email = email,
                    Gender = gender,
                    DateOfBirth = dob,
                    Biography = bio,
                    LookingFor = relationshipGoal,
                    PreferredGender = sexPref,
                    City = location.City,
                    Country = location.Country,
                    Latitude = location.Lat + latJitter,
                    Longitude = location.Lng + lngJitter,
                    FameRating = fameRating,
                    PasswordHash = hmacInner.ComputeHash(Encoding.UTF8.GetBytes("Password123!")),
                    PasswordSalt = hmacInner.Key,
                    CreatedAt = createdAt,
                    LastActive = lastActive,
                    EmailConfirmed = true,
                    HasLoggedIn = true,
                    IsBasicInfoComplete = true,
                    IsPreferencesComplete = true,
                    IsProfileCompleted = true,
                    PhotoProfileUrl = photoUrl,
                    Photos = new List<Photo>
                    {
                        new Photo
                        {
                            Url = photoUrl,
                            IsMain = true,
                            PublicId = $"seed_photo_{i + 1}",
                        }
                    }
                };

                users.Add(user);
            }

            await _context.AppUsers.AddRangeAsync(users);
            await _context.SaveChangesAsync();

            // Assign interests
            var userInterests = new List<UserInterest>();
            foreach (var user in users)
            {
                int interestCount = _rand.Next(2, 7);
                var picked = allInterests.OrderBy(_ => Guid.NewGuid()).Take(interestCount);
                foreach (var interest in picked)
                {
                    userInterests.Add(new UserInterest
                    {
                        UserId = user.Id,
                        InterestId = interest.Id
                    });
                }
            }

            await _context.UserInterests.AddRangeAsync(userInterests);
            await _context.SaveChangesAsync();
        }
    }
}
