namespace sparkdates.Application.Dtos.PhotoDtos
{
    public class UserPhotoDto
    {
        public required string Url { get; set; }
        public bool IsMain { get; set; }
        public string PublicId { get; set; }
        public Guid UserId { get; set; }
    }
}
