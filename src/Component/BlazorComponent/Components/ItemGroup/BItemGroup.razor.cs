using Microsoft.AspNetCore.Components;

namespace BlazorComponent
{
    public partial class BItemGroup : ItemGroupBase
    {
        public BItemGroup() : base(GroupType.ItemGroup)
        {
        }

        public BItemGroup(GroupType groupType) : base(groupType)
        {
        }

        [Parameter]
        public StringNumber Max { get; set; }

        [Parameter]
        public bool Dark { get; set; }

        [Parameter]
        public bool Light { get; set; }

        [CascadingParameter(Name = "IsDark")]
        public bool CascadingIsDark { get; set; }

        public virtual bool IsDark
        {
            get
            {
                if (Dark)
                {
                    return true;
                }

                if (Light)
                {
                    return false;
                }

                return CascadingIsDark;
            }
        }

        public async override Task ToggleAsync(StringNumber value)
        {
            if (_values.Contains(value))
            {
                _values.Remove(value);
            }
            else
            {
                if (!Multiple)
                {
                    _values.Clear();
                }

                if (Max == null || _values.Count < Max.TryGetNumber().number)
                {
                    _values.Add(value);
                }
            }

            if (Mandatory && _values.Count == 0)
            {
                _values.Add(value);
            }

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
    }
}
