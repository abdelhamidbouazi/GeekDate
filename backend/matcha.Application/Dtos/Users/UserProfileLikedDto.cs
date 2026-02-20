namespace matcha.Application.Dtos.Users
{
    public class UserProfileLikedDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int? Age { get; set; }
        public string ProfilePicture { get; set; }
    }
}
