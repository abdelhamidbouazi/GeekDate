using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using matcha.Application.Dtos.PhotoDtos;
using matcha.Application.Interfaces.Services.Cloudinary;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace matcha.Infrastructure.Services.CloudinaryStorage
{
    public class CloudinaryServiceAsync : ICloudinaryServiceAsync
    {
        private readonly Cloudinary _cloudinary;
        public CloudinaryServiceAsync(IOptions<CloudinarySettings> config)
        {
            var account = new Account(config.Value.CloudName, config.Value.ApiKey, config.Value.ApiSecret);
            _cloudinary = new Cloudinary(account);
        }
        public async Task<ImageUploadResultDto> UploadImageAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face"),
                    Folder = "matcha"
                };

                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            return new ImageUploadResultDto
            {
                Url = uploadResult.Url,
                PublicId = uploadResult.PublicId,
                Error = uploadResult.Error?.Message
            };
        }

        public async Task<DeletionResultDto> DeleteImageAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId);

            var result = await _cloudinary.DestroyAsync(deletionParams);

            return new DeletionResultDto
            {
                IsSuccessful = true,
                Message = result.Result
            };
        }

    }
}
