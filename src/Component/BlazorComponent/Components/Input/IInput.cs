﻿using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BlazorComponent
{
    public interface IInput<TValue> : IHasProviderComponent
    {
        TValue Value { get; }

        RenderFragment AppendContent
        {
            get
            {
                return default;
            }
        }

        string AppendIcon
        {
            get
            {
                return default;
            }
        }

        RenderFragment ChildContent { get; }

        Task HandleOnPrependClickAsync(MouseEventArgs args)
        {
            return Task.CompletedTask;
        }

        Task HandleOnAppendClickAsync(MouseEventArgs args)
        {
            return Task.CompletedTask;
        }

        

        string Label => default;

        RenderFragment LabelContent => default;

        bool HasLabel => default;

        bool ShowDetails => default;

        RenderFragment PrependContent
        {
            get
            {
                return default;
            }
        }

        string PrependIcon
        {
            get
            {
                return default;
            }
        }

        ElementReference InputSlotRef
        {
            get
            {
                return default;
            }
            set
            {
                //default todo nothing
            }
        }

        Task HandleOnClickAsync(MouseEventArgs args)
        {
            return Task.CompletedTask;
        }

        Task HandleOnMouseDownAsync(MouseEventArgs args)
        {
            return Task.CompletedTask;
        }

        Task HandleOnMouseUpAsync(MouseEventArgs args)
        {
            return Task.CompletedTask;
        }
    }
}
