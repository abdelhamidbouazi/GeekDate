namespace matcha.Application.Dtos.Users
{
    public class GetUserInterestsFromUserProfile
    {
        public Guid UserId { get; set; }
        public Guid InterestId { get; set; }
        public string Name { get; set; }
    }
}
