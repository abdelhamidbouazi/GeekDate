using System.Text.Json;

namespace matcha.Domain.Entities
{
    public class UserSearchPreference
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int MinAge { get; set; } = 18;
        public int MaxAge { get; set; } = 100;
        public int MinFameRating { get; set; } = 0;
        public int MaxFameRating { get; set; } = int.MaxValue;
        public double? MaxDistanceKm { get; set; }
        public string? InterestIds { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public AppUser User { get; set; } = null!;

        public IReadOnlyCollection<Guid> InterestGuids
        {
            get
            {
                if (string.IsNullOrWhiteSpace(InterestIds))
                    return Array.Empty<Guid>();

                return JsonSerializer.Deserialize<List<Guid>>(InterestIds)!;
            }
        }
    }
}
