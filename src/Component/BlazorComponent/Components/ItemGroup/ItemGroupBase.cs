using Microsoft.AspNetCore.Components;

namespace BlazorComponent
{
    public abstract class ItemGroupBase : BDomComponentBase
    {
        protected List<StringNumber> _values = new();

        public ItemGroupBase(GroupType groupType)
        {
            GroupType = groupType;
        }

        [Parameter]
        public string ActiveClass { get; set; }

        [Parameter]
        public RenderFragment ChildContent { get; set; }

        [Parameter]
        public GroupType? TargetGroup { get; set; }

        [Parameter]
        public bool Mandatory { get; set; }

        [Parameter]
        public bool Multiple { get; set; }

        [Parameter]
        public StringNumber Value
        {
            get => _values.LastOrDefault();
            set
            {
                _values.Clear();
                _values.Add(value);
                SetValue(value);
            }
        }

        [Parameter]
        public EventCallback<StringNumber> ValueChanged { get; set; }

        [Parameter]
        public List<StringNumber> Values
        {
            get => _values;
            set => _values = value;
        }

        [Parameter]
        public EventCallback<List<StringNumber>> ValuesChanged { get; set; }

        public GroupType GroupType { get; private set; }

        public List<IGroupable> Items { get; } = new();

        public List<StringNumber> AllValues => Items.Select(item => item.Value).ToList();

        protected override void OnParametersSet()
        {
            base.OnParametersSet();

            if (TargetGroup.HasValue)
            {
                GroupType = TargetGroup.Value;
            }
        }

        public virtual void Register(IGroupable item)
        {
            item.Value ??= Items.Count;

            // TODO: check exists
            Items.Add(item);

            // if no value provided and mandatory
            // assign first registered item
            if (Mandatory && Value == null)
            {
                Value = item.Value;
                if (ValueChanged.HasDelegate)
                {
                    _ = ValueChanged.InvokeAsync(Value);
                }
            }
        }

        public virtual void Unregister(IGroupable item)
        {
            Items.Remove(item);
        }

        private async Task UpdateMandatoryAsync(bool last = false)
        {
            if (Items.Count == 0) return;

            var items = new List<IGroupable>(Items);

            if (last) items.Reverse();

            var item = items.FirstOrDefault(item => !item.Disabled);

            if (item == null) return;

            await ToggleAsync(item.Value);
        }

        public async virtual Task ToggleAsync(StringNumber key)
        {
            UpdateValue(key);

            if (ValuesChanged.HasDelegate)
            {
                await ValuesChanged.InvokeAsync(_values);
            }
            else if (ValueChanged.HasDelegate)
            {
                await ValueChanged.InvokeAsync(_values.LastOrDefault());
            }
            else
            {
                StateHasChanged();
            }
        }

        private void UpdateValue(StringNumber key)
        {
            if (_values.Contains(key))
            {
                _values.Remove(key);
            }
            else
            {
                if (!Multiple)
                {
                    _values.Clear();
                }

                _values.Add(key);
            }

            if (Mandatory && _values.Count == 0)
            {
                _values.Add(key);
            }
        }
    }
}
