namespace BlazorComponent;

public partial class BWindowItemDefaultSlot<TWindowItem> : ComponentPartBase<TWindowItem> where TWindowItem : IWindowItem
{
    public RenderFragment ChildContent => Component.ChildContent;
}
