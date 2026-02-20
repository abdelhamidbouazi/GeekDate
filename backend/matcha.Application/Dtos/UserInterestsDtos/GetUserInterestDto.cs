namespace matcha.Application.Dtos.UserInterestsDtos
{
    public class GetUserInterestDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid InterestId { get; set; }
    }
}
