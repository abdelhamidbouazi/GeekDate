using sparkdates.Domain.Common.Enums;

namespace sparkdates.Application.Dtos.BrowseDtos
{
    public class BrowseUsersRequest
    {
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public int? MinFameRating { get; set; }
        public int? MaxFameRating { get; set; }
        public double? MaxDistanceKm { get; set; }
        public List<Guid>? FilterByTagIds { get; set; }
        public BrowseSortBy SortBy { get; set; } = BrowseSortBy.Distance;
        public bool SortDescending { get; set; } = false;
    }
}
