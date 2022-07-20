namespace BlazorComponent
{
    public partial class BWindowItem : BGroupItem<ItemGroupBase>, IWindowItem
    {
        protected BWindowItem() : base(GroupType.Window, bootable: true)
        {
        }

        /// <summary>
        /// just to refresh the component.
        /// </summary>
        [CascadingParameter(Name = "WindowValue")]
        public string WindowValue { get; set; }

        protected virtual string ComputedTransition { get; }

        protected virtual Task HandleOnBefore(ElementReference el)
        {
            return Task.CompletedTask;
        }

        protected virtual Task HandleOnAfter(ElementReference el)
        {
            return Task.CompletedTask;
        }

        protected virtual Task HandleOnEnter(ElementReference el)
        {
            return Task.CompletedTask;
        }
    }
}
