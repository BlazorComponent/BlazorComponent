using Microsoft.AspNetCore.Components.Forms;

namespace BlazorComponent.Components.FileInput.Dto;

public class PrecedingUploadingDto
{

    public HttpClient HttpClient { get; set; }

    public bool HasUploading { get; set; } = false;

    public IReadOnlyList<IBrowserFile> BrowserFiles{ get; set; }
}
