namespace matcha.Application.Dtos.Users
{
    public class BrowseUserDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int FameRating { get; set; }
        public string? ProfilePicture { get; set; }
        public double DistanceInMeters { get; set; }
        public int? Age { get; set; }

        public int CommonTagsCount { get; set; }  // For matching score
        public List<Guid>? InterestIds { get; set; }  // User's interests
    }
}
