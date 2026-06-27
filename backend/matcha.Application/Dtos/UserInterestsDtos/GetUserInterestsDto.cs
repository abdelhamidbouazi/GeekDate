namespace sparkdates.Application.Dtos.UserInterestsDtos
{
    public class GetUserInterestsDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid InterestId { get; set; }
    }
}
