using Microsoft.AspNetCore.Components;

namespace BlazorComponent
{
    public partial class BCascaderList<TItem, TValue>
    {
        [Parameter]
        public bool ChangeOnSelect { get; set; }

        [Parameter]
        public IList<TItem> Items { get; set; }

        [Parameter]
        public Func<TItem, string> ItemText { get; set; }

        [Parameter]
        public Func<TItem, List<TItem>> ItemChildren { get; set; }

        [Parameter]
        public Func<TItem, Task> LoadChildren { get; set; }

        [Parameter]
        public EventCallback<(TItem item, bool closeOnSelect)> OnSelect { get; set; }

        protected virtual string Icon { get; }

        protected TItem LoadingItem { get; set; }

        protected IList<TItem> Children { get; set; }

        protected TItem SelectedItem { get; set; }

        private bool IsLast => Children == null || Children.Count == 0;

        protected async Task SelectItemAsync(TItem item)
        {
            SelectedItem = item;
            Children = ItemChildren(item);

            if (LoadChildren != null && Children != null && Children.Count == 0)
            {
                LoadingItem = item;
                await LoadChildren(item);
                LoadingItem = default;

                Children = ItemChildren(item);
            }

            if (OnSelect.HasDelegate)
            {
                if (ChangeOnSelect)
                {
                    await OnSelect.InvokeAsync((item, IsLast));
                }
                else if (IsLast)
                {
                    await OnSelect.InvokeAsync((item, true));
                }
            }
        }
    }
}
