namespace BlazorComponent
{
    public abstract class BGroupable<TGroup> : BDomComponentBase, IGroupable
        where TGroup : ItemGroupBase
    {
        [CascadingParameter]
        public TGroup ItemGroup { get; set; }

        [Parameter]
        public string ActiveClass { get; set; }

        [Parameter]
        public virtual bool Disabled { get; set; }

        // TODO: use Value instead of IsActive
        [Parameter]
        public bool IsActive
        {
            get => _isActive ?? false;
            set => _isActive = value;
        }

        [Parameter]
        public StringNumber Value
        {
            get => _value;
            set
            {
                if (value == null) return;

                _value = value;
            }
        }

        /// <summary>
        /// whether to enable bootable.
        /// </summary>
        private readonly bool _bootable;

        /// <summary>
        /// the <see cref="GroupType"/> of the groupable component.
        /// </summary>
        private readonly GroupType _groupType;

        private bool? _isActive;
        private StringNumber _value;
        private bool _firstRenderAfterBooting;

        /// <summary>
        /// Initializes a base component <see cref="BGroupable{TGroup}"/> with the <see cref="GroupType"/>.
        /// </summary>
        /// <param name="groupType">the <see cref="GroupType"/> of the groupable component.</param>
        protected BGroupable(GroupType groupType)
        {
            _groupType = groupType;
        }

        /// <summary>
        /// Initializes a base component <see cref="BGroupable{TGroup}"/> with the <see cref="GroupType"/>
        /// and specifies whether to bootable.
        /// </summary>
        /// <param name="groupType">the <see cref="GroupType"/> of the groupable component.</param>
        /// <param name="bootable">determines whether bootable is enabled or not.</param>
        protected BGroupable(GroupType groupType, bool bootable) : this(groupType)
        {
            _bootable = bootable;
        }

        protected string ComputedActiveClass => ActiveClass ?? ItemGroup?.ActiveClass;

        protected bool Matched => ItemGroup != null && (ItemGroup.GroupType == _groupType);

        protected bool ValueMatched => Matched && ItemGroup.Values.Contains(Value);

        public bool InternalIsActive { get; private set; }

        /// <summary>
        /// Determines whether the component has been booted.
        /// </summary>
        protected bool IsBooted { get; private set; }

        protected override void OnInitialized()
        {
            base.OnInitialized();

            if (!Matched) return;

            if (this is IGroupable item)
            {
                ItemGroup.Register(item);
            }
        }

        protected override async Task OnParametersSetAsync()
        {
            if (_isActive.HasValue) // if setting by [Parameter]IsActive, Matched is not required.
            {
                await SetInternalIsActive(_isActive.Value);
            }
            else if (Matched)
            {
                await SetInternalIsActive(ValueMatched);
            }
        }

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            await base.OnAfterRenderAsync(firstRender);

            if (_firstRenderAfterBooting)
            {
                await Task.Delay(16);
                _firstRenderAfterBooting = false;

                InternalIsActive = true;
                StateHasChanged();
            }
        }

        protected virtual async Task ToggleAsync()
        {
            if (!Matched) return;

            await ItemGroup.ToggleAsync(Value);
        }

        protected async Task SetInternalIsActive(bool val)
        {
            if (_bootable && !IsBooted)
            {
                if (val)
                {
                    IsBooted = true;

                    _firstRenderAfterBooting = true;

                    await Task.Delay(16);

                    StateHasChanged();
                }
            }
            else if (InternalIsActive != val)
            {
                if (_firstRenderAfterBooting)
                {
                    // waiting for one frame(16ms) to make sure the element has been rendered,
                    // and then set the InternalIsActive to be true to invoke transition. 
                    await Task.Delay(16);
                    _firstRenderAfterBooting = false;
                }

                InternalIsActive = val;
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (Matched && this is IGroupable item)
            {
                ItemGroup.Unregister(item);
            }

            base.Dispose(disposing);
        }
    }
}
