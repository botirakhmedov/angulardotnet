using System;

namespace API.Errors;

public class FileItemResult
{
    public required string AbsoluteUrl { get; set; }
    public required string PublicId { get; set; }
    public ApiException? Error { get; set; }
}
