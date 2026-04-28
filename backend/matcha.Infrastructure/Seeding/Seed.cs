using Bogus;
using matcha.Domain.Common.Enums;
using matcha.Domain.Entities;
using matcha.Infrastructure.ApplicationDbContext;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace matcha.Infrastructure.Seeding
{
    public class Seed
    {
        private readonly AppDbContext _context;
        private readonly Random _rand = new Random();

        // Zones géographiques (Casablanca, Mohammedia, Rabat)
        private const double MinLat = 33.55;
        private const double MaxLat = 34.03;
        private const double MinLng = -7.65;
        private const double MaxLng = -6.83;

        private readonly HashSet<string> _usedLocations = new();

        public Seed(AppDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            if (await _context.AppUsers.AnyAsync())
                return;

            // Seed Interests
            var baseInterests = new List<string>
            {
                "Music", "Sports", "Travel", "Movies", "Coding",
                "Fitness", "Books", "Gaming", "Cooking", "Photography"
            };

            var interests = baseInterests.Select(i => new Interest { Name = i }).ToList();
            await _context.Interests.AddRangeAsync(interests);
            await _context.SaveChangesAsync();

            // Seed Users	
            using var hmac = new System.Security.Cryptography.HMACSHA512();

            var faker = new Faker("fr");
            var users = new List<AppUser>();

            for (int i = 0; i < 100; i++)
            {
                var gender = i % 2 == 0 ? Gender.Male : Gender.Female;

                var firstName = gender == Gender.Male
                    ? faker.Name.FirstName(Bogus.DataSets.Name.Gender.Male)
                    : faker.Name.FirstName(Bogus.DataSets.Name.Gender.Female);
                var lastName = faker.Name.LastName();
                var email = faker.Internet.Email(firstName, lastName);

                var user = new AppUser
                {
                    FirstName = firstName,
                    LastName = lastName,
                    UserName = $"user{i + 1}",
                    Email = email,
                    Gender = gender,
                    DateOfBirth = faker.Date.Between(DateTime.UtcNow.AddYears(-45), DateTime.UtcNow.AddYears(-18)),
                    Biography = faker.Lorem.Sentence(10),
                    LookingFor = faker.PickRandom<RelationshipGoals>(),
                    PreferredGender = faker.PickRandom<SexualPreferences>(),
                    City = faker.Address.City(),
                    Country = "Morocco",
                    Latitude = GenerateUniqueLatitude(),
                    Longitude = GenerateUniqueLongitude(),
                    FameRating = _rand.Next(0, 101),
                    PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Password123")),
                    PasswordSalt = hmac.Key,
                    CreatedAt = faker.Date.Past(1),
                    LastActive = DateTime.UtcNow,
                    IsPreferencesComplete = true,
                    Photos = new List<Photo>()
                };

                // Ajouter une photo principale
                user.Photos.Add(new Photo
                {
                    Url = $"https://randomuser.me/api/portraits/{(gender == Gender.Male ? "men" : "women")}/{i % 100}.jpg",
                    IsMain = true,
                    PublicId = $"photo_{i + 1}",
                    UserId = user.Id
                });

                users.Add(user);
            }

            await _context.AppUsers.AddRangeAsync(users);
            await _context.SaveChangesAsync();

            // Seed UserInterests
            var allInterests = await _context.Interests.ToListAsync();
            var userInterests = new List<UserInterest>();

            foreach (var user in users)
            {
                int count = _rand.Next(3, 6); // 3–5 intérêts par utilisateur
                var randomInterests = allInterests.OrderBy(x => Guid.NewGuid()).Take(count);

                foreach (var interest in randomInterests)
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
        private double GenerateUniqueLatitude()
        {
            double lat;
            string key;
            do
            {
                lat = MinLat + (_rand.NextDouble() * (MaxLat - MinLat));
                key = lat.ToString("F5");
            } while (_usedLocations.Contains(key));
            _usedLocations.Add(key);
            return lat;
        }

        private double GenerateUniqueLongitude()
        {
            double lng;
            string key;
            do
            {
                lng = MinLng + (_rand.NextDouble() * (MaxLng - MinLng));
                key = lng.ToString("F5");
            } while (_usedLocations.Contains(key));
            _usedLocations.Add(key);
            return lng;
        }
    }
}
