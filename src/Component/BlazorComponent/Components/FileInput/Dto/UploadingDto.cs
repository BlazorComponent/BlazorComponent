namespace BlazorComponent.Components.FileInput.Dto;

public class UploadingDto
{
    /// <summary>
    /// Stream
    /// </summary>
    public Stream Stream { get; set; }

    /// <summary>
    /// 文件名称
    /// </summary>
    public string FileName { get; set; }

    /// <summary>
    /// 名称（对应接口名称）
    /// </summary>
    public string Name { get; set; }
}
