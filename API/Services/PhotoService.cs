using API.Errors;
using API.Helpers;
using API.Interfaces;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace API.Services;

public class PhotoService : IPhotoService
{
    private readonly IMinioClient _minio;
    private const string BucketName = "devplatform";
    private readonly string cloudName;

    public PhotoService(IOptions<CloudSettings> config)
    {
        cloudName = config.Value.CloudName;
        _minio = new MinioClient()
            .WithEndpoint(config.Value.CloudName)
            .WithCredentials(config.Value.ApiKey, config.Value.ApiSecret)
            .WithSSL(false)
            .Build();
    }
    public async Task<bool> DeletePhotoAsync(string publicId)
    {
        bool retValue = true;
        try
        {
            await _minio.RemoveObjectAsync(new RemoveObjectArgs()
                        .WithBucket(BucketName)
                        .WithObject(publicId));
        }
        catch (Exception)
        {
            retValue = false;
        }

        return retValue;
    }

    public async Task<FileItemResult> UploadPhotoAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new FileLoadException();

        // Ensure bucket exists
        bool found = await _minio.BucketExistsAsync(new BucketExistsArgs().WithBucket(BucketName));
        if (!found)
        {
            await _minio.MakeBucketAsync(new MakeBucketArgs().WithBucket(BucketName));
            string policyJson = $@"
                                {{
                                ""Version"": ""2012-10-17"",
                                ""Statement"": [
                                    {{
                                    ""Effect"": ""Allow"",
                                    ""Principal"": {{ ""AWS"": ""*"" }},
                                    ""Action"": [ ""s3:GetObject"" ],
                                    ""Resource"": [ ""arn:aws:s3:::{BucketName}/*"" ]
                                    }}
                                ]
                                }}";

            await _minio.SetPolicyAsync(new SetPolicyArgs()
                .WithBucket(BucketName)
                .WithPolicy(policyJson));
        }


        // Upload to MinIO
        using var stream = file.OpenReadStream();
        var retVal = await _minio.PutObjectAsync(new PutObjectArgs()
            .WithBucket(BucketName)
            .WithObject(file.FileName)
            .WithStreamData(stream)
            .WithObjectSize(file.Length)
            .WithContentType(file.ContentType));
        FileItemResult fileItemResult = new FileItemResult()
        {
            PublicId = file.FileName,
            AbsoluteUrl = $@"http://{cloudName}/{BucketName}/{file.FileName}",
            Error = null
        };
        return fileItemResult;
    }
}
