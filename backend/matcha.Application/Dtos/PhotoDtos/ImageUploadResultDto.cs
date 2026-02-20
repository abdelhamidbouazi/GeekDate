namespace matcha.Application.Dtos.PhotoDtos
{
    public class ImageUploadResultDto
    {
        public Uri Url { get; set; }
        public string PublicId { get; set; }
        public string Error { get; set; }
    }
}
