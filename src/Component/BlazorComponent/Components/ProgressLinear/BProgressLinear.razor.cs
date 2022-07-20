using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace BlazorComponent
{
    public partial class BProgressLinear : BDomComponentBase
    {
        [Parameter]
        public string Color { get; set; }

        /// <summary>
        /// 使用 indeterminate 属性，BProgressLinear 会保持动画状态。
        /// </summary>
        [Parameter]
        public bool Indeterminate { get; set; }

        [Parameter]
        public double Value { get; set; }

        [Parameter]
        public bool Dark { get; set; }

        [Parameter]
        public bool Light { get; set; }

        [CascadingParameter(Name = "IsDark")]
        public bool CascadingIsDark { get; set; }

        public bool IsDark
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

        public virtual Task HandleOnClickAsync(MouseEventArgs args)
        {
            return Task.CompletedTask;
        }
    }
}
