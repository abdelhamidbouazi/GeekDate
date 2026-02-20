using matcha.Application.Dtos.PhotoDtos;
using Microsoft.AspNetCore.Http;

namespace matcha.Application.Interfaces.Services.Cloudinary
{
    public interface ICloudinaryServiceAsync
    {
        Task<ImageUploadResultDto> UploadImageAsync(IFormFile file);
        Task<DeletionResultDto> DeleteImageAsync(string publicId);
    }
}
