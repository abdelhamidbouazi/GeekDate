namespace matcha.Application.Dtos.Users
{
    public class UserDto
    {
        public string UserName { get; set; }
        public string PictureUrl { get; set; }
        public int NotificationCount { get; set; }
        public int UnreadMessagesCount { get; set; }
    }
}
