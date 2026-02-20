namespace matcha.Application.Dtos.Users
{
    public class ImageDto
    {
        public Guid Id { get; set; }
        public required string Url { get; set; }
        public bool IsMain { get; set; }
        public string PublicId { get; set; }

    }
}