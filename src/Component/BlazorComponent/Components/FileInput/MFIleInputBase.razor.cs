using BlazorComponent.Components.FileInput.Dto;
using Microsoft.AspNetCore.Components.Forms;

namespace BlazorComponent.Components.FileInput;

partial class MFIleInputBase
{
    [Parameter]
    public string Id { get; set; }

    [Inject]
    public HttpClient HttpClient { get; set; }

    [Parameter]
    public string? Accept { get; set; }

    [Parameter]
    public Action<IEnumerable<UploadingDto>>? OnChange { get; set; }

    public Action<PrecedingUploadingDto> PrecedingUploading { get; set; }

    [Parameter]
    public string? Url { get; set; }

    [Parameter]
    public int MaxmunFileCount { get; set; } = 10;

    [Parameter]
    public HttpMethod Method { get; set; } = HttpMethod.Post;

    [Parameter]
    public Action<HttpResponseMessage>? RespomseAction { get; set; }

    [Parameter]
    public bool? Multiple { get; set; }

    private async Task LoadFiles(InputFileChangeEventArgs e)
    {
        var uploading = new PrecedingUploadingDto
        {
            HttpClient = HttpClient,
            BrowserFiles = e.GetMultipleFiles(),
            HasUploading = true,
        };

        var uploadings = e.GetMultipleFiles(MaxmunFileCount).Select(x => new UploadingDto
        {
            Stream = x.OpenReadStream(x.Size),
            FileName = x.Name,
            Name = "file"
        });

        OnChange?.Invoke(uploadings);


        var files = new MultipartFormDataContent();

        foreach (var file in uploadings)
        {
            files.Add(new StreamContent(file.Stream),file.Name,file.FileName);
        }

        PrecedingUploading.Invoke(uploading);

        if (uploading.HasUploading)
        {
            if (!string.IsNullOrEmpty(Url))
            {
                var request = new HttpRequestMessage(Method, Url)
                {
                    Content = files
                };
                var message = await uploading.HttpClient.SendAsync(request);
                RespomseAction?.Invoke(message);
            }

        }
    }
}

