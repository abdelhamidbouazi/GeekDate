using matcha.Domain.Common.Enums;

namespace matcha.Application.Specifications
{
    public class BrowseUsersSpecification
    {
        public Guid UserId { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public int? MinFameRating { get; set; }
        public int? MaxFameRating { get; set; }
        public double? MaxDistanceKm { get; set; }
        public List<Guid>? FilterByTagIds { get; set; }
        public List<Guid>? ExcludedUserIds { get; set; }
        public BrowseSortBy SortBy { get; set; } = BrowseSortBy.Distance;
        public bool SortDescending { get; set; } = false;
        public Guid ExcludeUserId { get; set; }
        public List<Gender> PreferredGenders { get; set; } = new();
        public List<Guid> UserInterestIds { get; set; } = new();
        public double UserLatitude { get; set; }
        public double UserLongitude { get; set; }
        public double MaxDistanceMeters { get; set; }
    }
}
