using API.Errors;
using Imagekit;

namespace API.Interfaces;

public interface IPhotoService
{
    Task<FileItemResult> UploadPhotoAsync(IFormFile file);
    Task<bool> DeletePhotoAsync(string publicId);
}
