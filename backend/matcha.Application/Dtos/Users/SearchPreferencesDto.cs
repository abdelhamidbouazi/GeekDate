using sparkdates.Application.Specifications;

namespace sparkdates.Application.Dtos.Users
{
    public class SearchPreferencesDto
    {
        public int MinAge { get; set; }
        public int MaxAge { get; set; }
        public int MinFameRating { get; set; }
        public int MaxFameRating { get; set; }
        public double? MaxDistanceKm { get; set; }
        public List<Guid> SavedInterestIds { get; set; } = new();
        public SearchSortBy SortBy { get; set; } = SearchSortBy.Distance;
        public bool SortDescending { get; set; } = false;

        public bool IsFirstTime { get; set; } // True = defaults, False = saved preferences
    }

}
