﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace BlazorComponent
{
    public partial class BTableHeader : BDomComponentBase
    {
        [Parameter]
        public List<TableHeaderOptions> Headers { get; set; }

        [Parameter]
        public string Align { get; set; }
    }
}
