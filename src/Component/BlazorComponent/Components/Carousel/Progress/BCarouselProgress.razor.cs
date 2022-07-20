namespace BlazorComponent;

public partial class BCarouselProgress<TCarousel> : ComponentPartBase<TCarousel> where TCarousel : ICarousel
{
    public bool Progress => Component.Progress;

    public string ProgressColor => Component.ProgressColor;

    public double Value => Component.ProgressValue;
}
