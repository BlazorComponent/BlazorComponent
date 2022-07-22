namespace BlazorComponent
{
    public interface ICascader<TItem, TValue> : ISelect<TItem, TValue, TValue>
    {
        bool ChangeOnSelect { get; }
    }
}
