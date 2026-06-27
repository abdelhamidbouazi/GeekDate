namespace sparkdates.Application.Dtos.AccountDtos
{
    public class LoginResponseDto
    {
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool isEmailVerified { get; set; }
        public bool IsProfileCompleted { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string ProfilePhotoUrl { get; set; }
        //public int MatchesCount { get; set; }
        //public int NotificationsCount { get; set; }
    }
    //public sealed record LoginResponseDto(AppUser user, string AccessToken, string RefreshToken);

}
