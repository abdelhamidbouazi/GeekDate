using sparkdates.Application.Dtos.PhotoDtos;
using Microsoft.AspNetCore.Http;

namespace sparkdates.Application.Interfaces.Services.Cloudinary
{
    public interface ICloudinaryServiceAsync
    {
        Task<ImageUploadResultDto> UploadImageAsync(IFormFile file);
        Task<DeletionResultDto> DeleteImageAsync(string publicId);
    }
}
