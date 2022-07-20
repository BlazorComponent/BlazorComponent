namespace BlazorComponent;

public interface IWindowItem : IHasProviderComponent
{
    RenderFragment ChildContent { get; }
}
