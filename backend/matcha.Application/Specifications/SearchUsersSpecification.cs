using sparkdates.Domain.Common.Enums;

namespace sparkdates.Application.Specifications
{
    public class SearchUsersSpecification
    {
        public Guid ExcludeUserId { get; set; }
        public List<Gender> PreferredGenders { get; set; } = new();

        // User-defined criteria
        public int? MinAge { get; set; } = 18;
        public int? MaxAge { get; set; }
        public int? MinFameRating { get; set; }
        public int? MaxFameRating { get; set; }
        public double? UserLatitude { get; set; }
        public double? UserLongitude { get; set; }
        public double? MaxDistanceMeters { get; set; }
        public List<Guid>? RequiredInterestIds { get; set; }

        // Sorting
        public SearchSortBy SortBy { get; set; } = SearchSortBy.Distance;
        public bool SortDescending { get; set; } = false;
    }
    public enum SearchSortBy
    {
        Age,
        Distance,
        FameRating,
        CommonTags
    }
}
