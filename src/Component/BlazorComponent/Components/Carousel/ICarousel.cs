namespace BlazorComponent;

public interface ICarousel : IHasProviderComponent
{
    string DelimiterIcon { get; }

    bool HideDelimiters { get; }

    bool Progress { get; }

    string ProgressColor { get; }

    double ProgressValue { get; }

    bool Mandatory { get; }

    StringNumber InternalValue { get; }

    List<IGroupable> Items { get; }

    Task InternalValueChanged(StringNumber val);
}
