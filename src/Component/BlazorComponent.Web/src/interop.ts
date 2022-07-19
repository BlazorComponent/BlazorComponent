import registerDirective from "./directive/index";
import { registerExtraEvents } from "./events/index";
//#region mentions
import getOffset from "./modules/Caret";
import { getBlazorId, getElementSelector } from "./utils/index";

export function updateCanvas(element, hue: number) {
  const canvas = element as HTMLCanvasElement
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  const saturationGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  saturationGradient.addColorStop(0, 'hsla(0, 0%, 100%, 1)') // white
  saturationGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 1)`)
  ctx.fillStyle = saturationGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const valueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  valueGradient.addColorStop(0, 'hsla(0, 0%, 100%, 0)') // transparent
  valueGradient.addColorStop(1, 'hsla(0, 0%, 0%, 1)') // black
  ctx.fillStyle = valueGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

export function getZIndex(el?: Element | null): number {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return 0

  const index = +window.getComputedStyle(el).getPropertyValue('z-index')

  if (!index) return getZIndex(el.parentNode as Element)
  return index
}

export function addStepperEventListener(element: HTMLElement, isActive: Boolean) {
  if (element?.addEventListener) {
    element.addEventListener(
      'transitionend',
      e => onTransition(e, isActive, element),
      false
    );
  }
}

export function removeStepperEventListener(element: HTMLElement, isActive: Boolean) {
  if (element?.removeEventListener) {
    element.removeEventListener(
      'transitionend',
      e => onTransition(e, isActive, element),
      false
    );
  }
}

export function initStepperWrapper(element: HTMLElement) {
  if (!element.classList.contains('active')) {
    element.style.display = 'none';
  }

  var observer = new MutationObserver(function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName == 'class') {
          var target: HTMLElement = mutation.target as HTMLElement;
          if (target.classList.contains('active')) {
            target.style.display = '';
            enter(target, true);
          } else {
            leave(target);
            setTimeout(() => {
              target.style.display = 'none';
            }, 300);
          }
        }
      }
    }
  });

  observer.observe(element, { attributes: true, attributeFilter: ['class'] });
}

function onTransition(e: TransitionEvent, isActive: Boolean, element: HTMLElement) {
  if (!isActive ||
    e.propertyName !== 'height'
  ) return

  element.style.height = 'auto';
}

function enter(element: HTMLElement, isActive: Boolean) {
  let scrollHeight = 0

  // Render bug with height
  requestAnimationFrame(() => {
    scrollHeight = element.scrollHeight;
  });

  element.style.height = 0 + 'px';
  // Give the collapsing element time to collapse
  setTimeout(() => isActive && (element.style.height = (scrollHeight + 'px' || 'auto')), 450)
}

function leave(element: HTMLElement) {
  element.style.height = element.clientHeight + 'px';
  setTimeout(() => {
    element.style.height = 0 + 'px';
  }, 10)
}

export function getDom(element) {
  if (!element) {
    element = document.body;  // TODO: really ???
  } else if (typeof element === 'string') {
    if (element === 'document') {
      return document.documentElement;
    } else if (element.indexOf('.') > 0) {
      let array = element.split('.');
      let el = document.querySelector(array[0]);
      if (!el) {
        return null;
      }

      element = el[array[1]];
    } else {
      element = document.querySelector(element);
    }
  }
  return element;
}

export function getDomInfo(element, selector = "body") {
  var result = {};

  var dom = getDom(element);

  if (dom) {
    if (dom.style && dom.style['display'] === 'none') {
      // clone and set display not none becuase
      // element with display:none can not get the dom info
      var cloned = dom.cloneNode(true);
      cloned.style['display'] = 'inline-block';
      cloned.style['z-index'] = -1000;
      dom.parentElement.appendChild(cloned);

      result = getDomInfoObj(cloned);

      dom.parentElement.removeChild(cloned);
    } else {
      result = getDomInfoObj(dom);
    }
  }

  return result;
}

function getDomInfoObj(dom) {
  var result = {};
  result["offsetTop"] = dom.offsetTop || 0;
  result["offsetLeft"] = dom.offsetLeft || 0;
  result["scrollHeight"] = dom.scrollHeight || 0;
  result["scrollWidth"] = dom.scrollWidth || 0;
  result["scrollLeft"] = dom.scrollLeft || 0;
  result["scrollTop"] = dom.scrollTop || 0;
  result["clientTop"] = dom.clientTop || 0;
  result["clientLeft"] = dom.clientLeft || 0;
  result["clientHeight"] = dom.clientHeight || 0;
  result["clientWidth"] = dom.clientWidth || 0;
  var position = getElementPos(dom);
  result["offsetWidth"] = Math.round(position.offsetWidth) || 0;
  result["offsetHeight"] = Math.round(position.offsetHeight) || 0;
  result["relativeTop"] = Math.round(position.relativeTop) || 0;
  result["relativeBottom"] = Math.round(position.relativeBottom) || 0;
  result["relativeLeft"] = Math.round(position.relativeLeft) || 0;
  result["relativeRight"] = Math.round(position.relativeRight) || 0;
  result["absoluteLeft"] = Math.round(position.absoluteLeft) || 0;
  result["absoluteTop"] = Math.round(position.absoluteTop) || 0;
  return result;
}

function getElementPos(element) {
  var res: any = new Object();
  res.x = 0;
  res.y = 0;
  if (element !== null) {
    if (element.getBoundingClientRect) {
      var viewportElement = document.documentElement;
      var box = element.getBoundingClientRect();
      var scrollLeft = viewportElement.scrollLeft;
      var scrollTop = viewportElement.scrollTop;

      res.offsetWidth = box.width;
      res.offsetHeight = box.height;
      res.relativeTop = box.top;
      res.relativeBottom = box.bottom;
      res.relativeLeft = box.left;
      res.relativeRight = box.right;
      res.absoluteLeft = box.left + scrollLeft;
      res.absoluteTop = box.top + scrollTop;
    }
  }
  return res;
}

export function addFileClickEventListener(btn) {
  if ((btn as HTMLElement).addEventListener) {
    (btn as HTMLElement).addEventListener("click", fileClickEvent);
  }
}

export function removeFileClickEventListener(btn) {
  (btn as HTMLElement).removeEventListener("click", fileClickEvent);
}

export function fileClickEvent() {
  var fileId = this.attributes["data-fileid"].nodeValue;
  var element = document.getElementById(fileId);
  (element as HTMLInputElement).click();
}

export function clearFile(element) {
  element.setAttribute("type", "input");
  element.value = '';
  element.setAttribute("type", "file");
}

export function getFileInfo(element) {
  if (element.files && element.files.length > 0) {
    var fileInfo = [];
    for (var i = 0; i < element.files.length; i++) {
      var file = element.files[i];
      var objectUrl = getObjectURL(file);
      fileInfo.push({
        fileName: file.name,
        size: file.size,
        objectURL: objectUrl,
        type: file.type
      });
    }

    return fileInfo;
  }
}

export function getObjectURL(file: File) {
  var url = null;
  if (window.URL != undefined) {
    url = window.URL.createObjectURL(file);
  } else if (window.webkitURL != undefined) {
    url = window.webkitURL.createObjectURL(file);
  }
  return url;
}

export function uploadFile(element, index, data, headers, fileId, url, name, instance, percentMethod, successMethod, errorMethod) {
  let formData = new FormData();
  var file = element.files[index];
  var size = file.size;
  formData.append(name, file);
  if (data != null) {
    for (var key in data) {
      formData.append(key, data[key]);
    }
  }
  const req = new XMLHttpRequest()
  req.onreadystatechange = function () {
    if (req.readyState === 4) {
      if (req.status != 200) {
        instance.invokeMethodAsync(errorMethod, fileId, `{"status": ${req.status}}`);
        return;
      }
      instance.invokeMethodAsync(successMethod, fileId, req.responseText);
    }
  }
  req.upload.onprogress = function (event) {
    var percent = Math.floor(event.loaded / size * 100);
    instance.invokeMethodAsync(percentMethod, fileId, percent);
  }
  req.onerror = function (e) {
    instance.invokeMethodAsync(errorMethod, fileId, "error");
  }
  req.open('post', url, true)
  if (headers != null) {
    for (var header in headers) {
      req.setRequestHeader(header, headers[header]);
    }
  }
  req.send(formData)
}

export function triggerEvent(element, eventType, eventName, stopPropagation) {
  var dom = getDom(element);
  var evt = document.createEvent(eventType);
  evt.initEvent(eventName);

  if (stopPropagation) {
    evt.stopPropagation();
  }

  return dom.dispatchEvent(evt);
}

export function setProperty(element, name, value) {
  var dom = getDom(element);
  dom[name] = value;
}

export function getBoundingClientRect(element, attach = "body") {
  let dom = getDom(element);

  var result = {}

  if (dom && dom.getBoundingClientRect) {
    if (dom.style && dom.style['display'] === 'none') {
      var cloned = dom.cloneNode(true);
      cloned.style['display'] = 'inline-block';
      cloned.style['z-index'] = -1000;
      document.querySelector(attach)?.appendChild(cloned);

      result = cloned.getBoundingClientRect();

      document.querySelector(attach)?.removeChild(cloned);
    } else {
      result = dom.getBoundingClientRect()
    }
  }

  return result;
}

export function getFirstChildBoundingClientRect(element, selector = "body") {
  let dom = getDom(element);
  if (dom.firstElementChild) {
    if (dom.firstElementChild.style['display'] === 'none') {
      // clone and set display not none becuase
      // element with display:none can not getBoundingClientRect
      var cloned = dom.firstElementChild.cloneNode(true);
      cloned.style['display'] = 'inline-block'
      cloned.style['z-index'] = -1000
      document.querySelector(selector).appendChild(cloned);
      var value = getBoundingClientRect(cloned);
      document.querySelector(selector).removeChild(cloned);
      return value;
    } else {
      return getBoundingClientRect(dom.firstElementChild);
    }
  }
  return null;
}

var htmlElementEventListennerConfigs: { [prop: string]: any[] } = {}

export function addHtmlElementEventListener<K extends keyof HTMLElementTagNameMap>(
  selector: "window" | "document" | K,
  type: string,
  invoker: DotNet.DotNetObject,
  options?: boolean | AddEventListenerOptions,
  extras?: Partial<Pick<Event, "stopPropagation" | "preventDefault">> & { relatedTarget?: string, throttle?: number, debounce?: number, key?: string }) {
  let htmlElement: HTMLElement | Window

  if (selector == "window") {
    htmlElement = window;
  } else if (selector == "document") {
    htmlElement = document.documentElement;
  } else {
    htmlElement = document.querySelector(selector);
  }

  var key = extras?.key || `${selector}:${type}`;

  //save for remove
  var config = {};

  var listener = (args: any): void => {
    if (extras?.stopPropagation) {
      args.stopPropagation();
    }

    if (extras?.preventDefault) {
      args.preventDefault();
    }

    // mouseleave relatedTarget
    if (extras?.relatedTarget && document.querySelector(extras.relatedTarget)?.contains(args.relatedTarget)) {
      return;
    }

    const obj = {};

    for (var k in args) {
      if (typeof args[k] == 'string' || typeof args[k] == 'number') {
        obj[k] = args[k];
      } else if (k == 'target' && args.target.attributes) {
        var target = {
          attributes: {}
        };

        for (let index = 0; index < args.target.attributes.length; index++) {
          const attr = args.target.attributes[index];
          target.attributes[attr.name] = attr.value;
        }
        obj[k] = target;
      } else if (k == 'touches' || k == 'targetTouches' || k == 'changedTouches') {
        var list = [];
        args[k].forEach(touch => {
          var item = {};

          for (var attr in touch) {
            if (typeof (touch[attr]) == 'string' || typeof (touch[attr]) == 'number') {
              item[attr] = touch[attr];
            }
          }
          list.push(item);
        });

        obj[k] = list;
      }
    }

    invoker.invokeMethodAsync('Invoke', obj);
  };

  if (extras?.debounce && extras.debounce > 0) {
    let timeout: NodeJS.Timeout;
    config["listener"] = function (args: any) {
      clearTimeout(timeout)
      timeout = setTimeout(() => listener(args), extras.debounce);
    }
  }
  else if (extras?.throttle && extras.throttle > 0) {
    let throttled: boolean;
    config["listener"] = function (args: any) {
      if (!throttled) {
        listener(args)
        throttled = true;
        setTimeout(() => {
          throttled = false;
        }, (extras?.throttle ?? 0));
      }
    }
  } else {
    config["listener"] = listener;
  }

  config['options'] = options;

  if (htmlElementEventListennerConfigs[key]) {
    htmlElementEventListennerConfigs[key].push(config);
  } else {
    htmlElementEventListennerConfigs[key] = [config]
  }

  if (htmlElement) {
    htmlElement.addEventListener(type, config["listener"], options);
  }
}

export function removeHtmlElementEventListener(selector, type, k?: string) {
  let htmlElement: any

  if (selector == "window") {
    htmlElement = window;
  } else if (selector == "document") {
    htmlElement = document.documentElement;
  } else {
    htmlElement = document.querySelector(selector);
  }

  var k = k || `${selector}:${type}`;

  var configs = htmlElementEventListennerConfigs[k];

  if (configs) {
    configs.forEach(item => {
      htmlElement?.removeEventListener(type, item["listener"], item['options']);
    });

    htmlElementEventListennerConfigs[k] = []
  }
}

var outsideClickListenerCaches: { [key: string]: any } = {}

export function addOutsideClickEventListener(invoker, noInvokeSelectors: string[], invokeSelectors: string[], contentElement) {
  if (!noInvokeSelectors) return;

  noInvokeSelectors = noInvokeSelectors.filter(s => !!s)

  var listener = function (args) {
    var exists = noInvokeSelectors.some(s => getDom(s)?.contains(args.target));
    if (exists) return;

    var pointerSelector = getElementSelector(args.target)

    if (invokeSelectors) {
      if (invokeSelectors.some(s => getDom(s)?.contains(args.target))) {
        invoker.invokeMethodAsync("Invoke", {pointerSelector});
      }
    } else {
      invoker.invokeMethodAsync("Invoke", {pointerSelector});
    }
  }

  document.addEventListener("click", listener, true);

  var key = `(${noInvokeSelectors.join(',')})document:click`

  outsideClickListenerCaches[key] = listener;
}

export function removeOutsideClickEventListener(noInvokeSelectors: string[]) {
  if (!noInvokeSelectors) return;

  noInvokeSelectors = noInvokeSelectors.filter(s => !!s)

  var key = `(${noInvokeSelectors.join(',')})document:click`

  if (outsideClickListenerCaches[key]) {
    document.removeEventListener('click', outsideClickListenerCaches[key], true);
    outsideClickListenerCaches[key] = undefined
  }
}

export function addMouseleaveEventListener(selector) {
  var htmlElement = document.querySelector(selector);
  if (htmlElement) {
    htmlElement.addEventListener()
  }
}

export function contains(e1, e2) {
  const dom1 = getDom(e1);
  if (dom1 && dom1.contains) {
    return dom1.contains(getDom(e2));
  }
  return false;
}

export function equalsOrContains(e1: any, e2: any) {
  const dom1 = getDom(e1);
  const dom2 = getDom(e2);
  return !!dom1 && dom1.contains && !!dom2 && (dom1 == dom2 || dom1.contains(dom2));
}

export function matchMedia(query) {
  return window.matchMedia(query).matches;
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

export function copy(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

export function focus(selector, noScroll: boolean = false) {
  let dom = getDom(selector);
  if (!(dom instanceof HTMLElement))
    throw new Error("Unable to focus an invalid element.");
  dom.focus({
    preventScroll: noScroll
  })
}

export function select(selector) {
  let dom = getDom(selector);
  if (!(dom instanceof HTMLInputElement || dom instanceof HTMLTextAreaElement))
    throw new Error("Unable to select an invalid element")
  dom.select()
}

export function hasFocus(selector) {
  let dom = getDom(selector);
  return (document.activeElement === dom);
}

export function blur(selector) {
  let dom = getDom(selector);
  dom.blur();
}

export function log(text) {
  console.log(text);
}

export function backTop(target: string) {
  let dom = getDom(target);
  if (dom) {
    slideTo(dom.scrollTop);
  } else {
    slideTo(0);
  }
}

function slideTo(targetPageY) {
  var timer = setInterval(function () {
    var currentY = document.documentElement.scrollTop || document.body.scrollTop;
    var distance = targetPageY > currentY ? targetPageY - currentY : currentY - targetPageY;
    var speed = Math.ceil(distance / 10);
    if (currentY == targetPageY) {
      clearInterval(timer);
    } else {
      window.scrollTo(0, targetPageY > currentY ? currentY + speed : currentY - speed);
    }
  }, 10);
}

export function scrollTo(target) {
  let dom = getDom(target);
  if (dom instanceof HTMLElement) {
    dom.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }
}

export function scrollToActiveElement(container, target) {
  let dom: HTMLElement = getDom(container);

  target = dom.querySelector('.active') as HTMLElement;
  if (!target) {
    return;
  }

  dom.scrollTop = target.offsetTop - dom.offsetHeight / 2 + target.offsetHeight / 2;
}

export function scrollToPosition(container, position) {
  var dom = getDom(container);
  dom.scrollTo({ top: position, behavior: 'smooth'})
}

export function getFirstChildDomInfo(element, selector = "body") {
  var dom = getDom(element);
  if (dom.firstElementChild)
    return getDomInfo(dom.firstElementChild, selector);
  return getDomInfo(dom, selector);
}

export function addClsToFirstChild(element, className) {
  var dom = getDom(element);
  if (dom.firstElementChild) {
    dom.firstElementChild.classList.add(className);
  }
}

export function removeClsFromFirstChild(element, className) {
  var dom = getDom(element);
  if (dom.firstElementChild) {
    dom.firstElementChild.classList.remove(className);
  }
}

export function getAbsoluteTop(e) {
  var offset = e.offsetTop;
  if (e.offsetParent != null) {
    offset += getAbsoluteTop(e.offsetParent);
  }
  return offset;
}

export function getAbsoluteLeft(e) {
  var offset = e.offsetLeft;
  if (e.offsetParent != null) {
    offset += getAbsoluteLeft(e.offsetParent);
  }
  return offset;
}

export function addElementToBody(element) {
  document.body.appendChild(element);
}

export function delElementFromBody(element) {
  document.body.removeChild(element);
}

export function addElementTo(addElement, elementSelector) {
  let parent = getDom(elementSelector);
  if (parent && addElement) {
    parent.appendChild(addElement);
  }
}

export function delElementFrom(delElement, elementSelector) {
  let parent = getDom(elementSelector);
  if (parent && delElement) {
    parent.removeChild(delElement);
  }
}

export function getActiveElement() {
  let element = document.activeElement;
  let id = element.getAttribute("id") || "";
  return id;
}

export function focusDialog(selector: string, count: number = 0) {
  let ele = <HTMLElement>document.querySelector(selector);
  if (ele && !ele.hasAttribute("disabled")) {
    setTimeout(() => {
      ele.focus();
      let curId = "#" + getActiveElement();
      if (curId !== selector) {
        if (count < 10) {
          focusDialog(selector, count + 1);
        }
      }
    }, 10);
  }
}

export function getWindow() {
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    pageXOffset: window.pageXOffset,
    pageYOffset: window.pageYOffset,
    isTop: window.scrollY == 0,
    isBottom: (window.scrollY + window.innerHeight) == document.body.clientHeight
  };
}

export function getWindowAndDocumentProps(windowProps: string[] = [], documentProps: string[] = []) {
  const obj = {}

  if (windowProps) {
    windowProps.forEach(prop => obj[prop] = window[prop]);
  }

  if (documentProps) {
    documentProps.forEach(prop => obj[prop] = document.documentElement[prop]);
  }

  return obj
}

function debounce(func, wait, immediate) {
  var timeout;
  return () => {
    const context = this, args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export function css(element: any, name: string | object, value: string | null = null) {
  var dom = getDom(element);
  if (typeof name === 'string') {
    dom.style[name] = value;
  } else {
    for (let key in name) {
      if (name.hasOwnProperty(key)) {
        dom.style[key] = name[key];
      }
    }
  }
}

export function addCls(selector: Element | string, clsName: string | Array<string>) {
  let element = getDom(selector);

  if (typeof clsName === "string") {
    element.classList.add(clsName);
  } else {
    element.classList.add(...clsName);
  }
}

export function removeCls(selector: Element | string, clsName: string | Array<string>) {
  let element = getDom(selector);

  if (typeof clsName === "string") {
    element.classList.remove(clsName);
  } else {
    element.classList.remove(...clsName);
  }
}

export function elementScrollIntoView(selector: Element | string) {
  let element = getDom(selector);

  if (!element)
    return;

  element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
}

const oldBodyCacheStack = [];

const hasScrollbar = () => {
  let overflow = document.body.style.overflow;
  if (overflow && overflow === "hidden") return false;
  return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
}

export function disableBodyScroll() {
  let body = document.body;
  const oldBodyCache = {};
  ["position", "width", "overflow"].forEach((key) => {
    oldBodyCache[key] = body.style[key];
  });
  oldBodyCacheStack.push(oldBodyCache);
  css(body,
    {
      "position": "relative",
      "width": hasScrollbar() ? "calc(100% - 17px)" : null,
      "overflow": "hidden"
    });
  addCls(document.body, "ant-scrolling-effect");
}

export function enableBodyScroll() {
  let oldBodyCache = oldBodyCacheStack.length > 0 ? oldBodyCacheStack.pop() : {};

  css(document.body,
    {
      "position": oldBodyCache["position"] ?? null,
      "width": oldBodyCache["width"] ?? null,
      "overflow": oldBodyCache["overflow"] ?? null
    });
  removeCls(document.body, "ant-scrolling-effect");
}

export function destroyAllDialog() {
  document.querySelectorAll('.ant-modal-root')
    .forEach(e => document.body.removeChild(e.parentNode));
}

export function createIconFromfontCN(scriptUrl) {
  if (document.querySelector(`[data-namespace="${scriptUrl}"]`)) {
    return;
  }
  const script = document.createElement('script');
  script.setAttribute('src', scriptUrl);
  script.setAttribute('data-namespace', scriptUrl);
  document.body.appendChild(script);
}

export function getScroll() {
  return { x: window.pageXOffset, y: window.pageYOffset };
}

export function getInnerText(element) {
  let dom = getDom(element);
  return dom.innerText;
}

export function getMenuOrDialogMaxZIndex(exclude: Element[] = [], element: Element) {
  const base = getDom(element);
  // Start with lowest allowed z-index or z-index of
  // base component's element, whichever is greater
  const zis = [getZIndex(base)]

  const activeElements = [
    ...document.getElementsByClassName('m-menu__content--active'),
    ...document.getElementsByClassName('m-dialog__content--active'),
  ]

  // Get z-index for all active dialogs
  for (let index = 0; index < activeElements.length; index++) {
    if (!exclude.includes(activeElements[index])) {
      zis.push(getZIndex(activeElements[index]))
    }
  }

  return Math.max(...zis)
}

export function getMaxZIndex() {
  return [...document.all].reduce((r, e) => Math.max(r, +window.getComputedStyle(e).zIndex || 0), 0)
}

export function getStyle(element, styleProp) {
  element = getDom(element);

  if (element.currentStyle) {
    return element.currentStyle[styleProp];
  } else if (window.getComputedStyle) {
    return document.defaultView.getComputedStyle(element, null).getPropertyValue(styleProp);
  }
}

export function getTextAreaInfo(element) {
  var result = {};
  var dom = getDom(element);
  result["scrollHeight"] = dom.scrollHeight || 0;

  if (element.currentStyle) {
    result["lineHeight"] = parseFloat(element.currentStyle["line-height"]);
    result["paddingTop"] = parseFloat(element.currentStyle["padding-top"]);
    result["paddingBottom"] = parseFloat(element.currentStyle["padding-bottom"]);
    result["borderBottom"] = parseFloat(element.currentStyle["border-bottom"]);
    result["borderTop"] = parseFloat(element.currentStyle["border-top"]);
  } else if (window.getComputedStyle) {
    result["lineHeight"] = parseFloat(document.defaultView.getComputedStyle(element, null).getPropertyValue("line-height"));
    result["paddingTop"] = parseFloat(document.defaultView.getComputedStyle(element, null).getPropertyValue("padding-top"));
    result["paddingBottom"] = parseFloat(document.defaultView.getComputedStyle(element, null).getPropertyValue("padding-bottom"));
    result["borderBottom"] = parseFloat(document.defaultView.getComputedStyle(element, null).getPropertyValue("border-bottom"));
    result["borderTop"] = parseFloat(document.defaultView.getComputedStyle(element, null).getPropertyValue("border-top"));
  }
  //Firefox can return this as NaN, so it has to be handled here like that.
  if (Object.is(NaN, result["borderTop"]))
    result["borderTop"] = 1;
  if (Object.is(NaN, result["borderBottom"]))
    result["borderBottom"] = 1;
  return result;
}

const funcDict = {};

export function registerResizeTextArea(element, minRows, maxRows, objReference) {
  if (!objReference) {
    disposeResizeTextArea(element);
  } else {
    objReferenceDict[element.id] = objReference;
    funcDict[element.id + "input"] = function () {
      resizeTextArea(element, minRows, maxRows);
    }
    element.addEventListener("input", funcDict[element.id + "input"]);
    return getTextAreaInfo(element);
  }
}

export function disposeResizeTextArea(element) {
  element.removeEventListener("input", funcDict[element.id + "input"]);
  objReferenceDict[element.id] = null;
  funcDict[element.id + "input"] = null;

}

export function resizeTextArea(element, minRows, maxRows) {
  var dims = getTextAreaInfo(element);
  var rowHeight = dims["lineHeight"];
  var offsetHeight = dims["paddingTop"] + dims["paddingBottom"] + dims["borderTop"] + dims["borderBottom"];
  var oldHeight = parseFloat(element.style.height);
  element.style.height = 'auto';

  var rows = Math.trunc(element.scrollHeight / rowHeight);
  rows = Math.max(minRows, rows);

  var newHeight = 0;
  if (rows > maxRows) {
    rows = maxRows;

    newHeight = (rows * rowHeight + offsetHeight);
    element.style.height = newHeight + "px";
    element.style.overflowY = "visible";
  } else {
    newHeight = rows * rowHeight + offsetHeight;
    element.style.height = newHeight + "px";
    element.style.overflowY = "hidden";
  }
  if (oldHeight !== newHeight) {
    let textAreaObj = objReferenceDict[element.id];
    textAreaObj.invokeMethodAsync("ChangeSizeAsyncJs", parseFloat(element.scrollWidth), newHeight);
  }
}


const objReferenceDict = {};

export function disposeObj(objReferenceName) {
  delete objReferenceDict[objReferenceName];
}

export function getCursorXY(element, objReference) {
  objReferenceDict["mentions"] = objReference;
  window.addEventListener("click", mentionsOnWindowClick);

  var offset = getOffset(element);

  return [offset.left, offset.top + offset.height + 14];
}

function mentionsOnWindowClick(e) {
  let mentionsObj = objReferenceDict["mentions"];
  if (mentionsObj) {
    mentionsObj.invokeMethodAsync("CloseMentionsDropDown");
  } else {
    window.removeEventListener("click", mentionsOnWindowClick);
  }
}

//#endregion

export { disableDraggable, enableDraggable, resetModalPosition } from "./modules/dragHelper";

export function bindTableHeaderAndBodyScroll(bodyRef, headerRef) {
  bodyRef.bindScrollLeftToHeader = () => {
    headerRef.scrollLeft = bodyRef.scrollLeft;
  }
  bodyRef.addEventListener('scroll', bodyRef.bindScrollLeftToHeader);
}

export function unbindTableHeaderAndBodyScroll(bodyRef) {
  if (bodyRef) {
    bodyRef.removeEventListener('scroll', bodyRef.bindScrollLeftToHeader);
  }
}

function preventKeys(e, keys: string[]) {
  if (keys.indexOf(e.key.toUpperCase()) !== -1) {
    e.preventDefault();
    return false;
  }
}

export function addPreventKeys(inputElement, keys: string[]) {
  if (inputElement) {
    let dom = getDom(inputElement);
    keys = keys.map(function (x) {
      return x.toUpperCase();
    })
    funcDict[inputElement.id + "keydown"] = (e) => preventKeys(e, keys);
    (dom as HTMLElement).addEventListener("keydown", funcDict[inputElement.id + "keydown"], false);
  }
}

export function removePreventKeys(inputElement) {
  if (inputElement) {
    let dom = getDom(inputElement);
    (dom as HTMLElement).removeEventListener("keydown", funcDict[inputElement.id + "keydown"]);
    funcDict[inputElement.id + "keydown"] = null;
  }
}

function preventKeyOnCondition(e, key: string, check: () => boolean) {
  if (e.key.toUpperCase() === key.toUpperCase() && check()) {
    e.preventDefault();
    return false;
  }
}

export function addPreventEnterOnOverlayVisible(element, overlayElement) {
  if (element && overlayElement) {
    let dom = getDom(element);
    funcDict[element.id + "keydown:Enter"] = (e) => preventKeyOnCondition(e, "enter", () => overlayElement.offsetParent !== null);
    (dom as HTMLElement).addEventListener("keydown", funcDict[element.id + "keydown:Enter"], false);
  }
}

export function removePreventEnterOnOverlayVisible(element) {
  if (element) {
    let dom = getDom(element);
    (dom as HTMLElement).removeEventListener("keydown", funcDict[element.id + "keydown:Enter"]);
    funcDict[element.id + "keydown:Enter"] = null;
  }
}

export function insertAdjacentHTML(position, text: string) {
  document.head.insertAdjacentHTML(position, text);
}

export function getImageDimensions(src: string) {
  return new Promise(function (resolve, reject) {
    var img = new Image()
    img.src = src
    img.onload = function () {
      resolve({
        width: img.width,
        height: img.height,
        hasError: false
      })
    }
    img.onerror = function () {
      resolve({
        width: 0,
        height: 0,
        hasError: true
      })
    }
  })
}

export function enablePreventDefaultForEvent(element: any, event: string, condition?: any) {
  const dom = getDom(element);
  if (!dom) return;
  if (event === 'keydown') {
    dom.addEventListener(event, (e: KeyboardEvent) => {
      if (Array.isArray(condition)) {
        var codes = condition as string[];
        if (codes.includes(e.code)) {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    })
  } else {
    dom.addEventListener(event, e => {
      if (e.preventDefault) {
        e.preventDefault();
      }
    })
  }
}

export function resizeObserver(selector: string, invoker: DotNet.DotNetObject) {
  var el = document.querySelector(selector);
  if (!el) return;

  const resizeObserver = new ResizeObserver((entries => {
    const dimensions = [];
    for (var entry of entries) {
      const dimension = entry.contentRect;
      dimensions.push(dimension);
    }
    invoker.invokeMethodAsync('Invoke', dimensions);
  }));

  resizeObserver.observe(el);
}

export function intersectionObserver(selector: string, invokers: DotNet.DotNetObject[]) {
  var el = document.querySelector(selector);
  if (!el) return;

  const observer = new IntersectionObserver((
    entries: IntersectionObserverEntry[] = [],
    observer: IntersectionObserver
  ) => {
    if (entries.some(e => e.isIntersecting)) {
      invokers.forEach(item => {
        item.invokeMethodAsync('Invoke')
      })
    }
  })

  observer.observe(el)
}

export function getBoundingClientRects(selector) {
  var elements = document.querySelectorAll(selector);

  var result = [];

  for (var i = 0; i < elements.length; i++) {
    var e: Element = elements[i];
    var dom = {
      id: e.id,
      rect: e.getBoundingClientRect()
    };
    result.push(dom);
  }

  return result;
}

export function getSize(selectors, sizeProp) {
  var el = getDom(selectors);

  var display = el.style.display;
  var overflow = el.style.overflow;

  el.style.display = "";
  el.style.overflow = "hidden";

  var size = el["offset" + sizeProp.charAt(0).toUpperCase() + sizeProp.slice(1)] || 0;

  el.style.display = display;
  el.style.overflow = overflow;

  return size;
}

export function getProp(selectors, name) {
  var el = getDom(selectors);
  if (!el) {
    return null;
  }

  return el[name];
}

export function updateWindowTransition(selectors, isActive, item) {
  var el: HTMLElement = getDom(selectors);
  var container: HTMLElement = el.querySelector('.m-window__container');

  if (item) {
    var itemEl: HTMLElement = getDom(item);
    container.style.height = itemEl.clientHeight + 'px';
    return;
  }

  if (isActive) {
    container.classList.add('m-window__container--is-active');
    container.style.height = el.clientHeight + 'px';
  } else {
    container.style.height = '';
    container.classList.remove('m-window__container--is-active');
  }
}

export function getScrollHeightWithoutHeight(selectors) {
  var el: HTMLElement = getDom(selectors);
  if (!el) {
    return 0;
  }

  var height = el.style.height;
  el.style.height = '0'
  var scrollHeight = el.scrollHeight;
  el.style.height = height;

  return scrollHeight;
}

//register custom events
window.onload = function () {
  registerExtraEvents();
  registerPasteWithData("pastewithdata")
  registerDirective();
}

function registerPasteWithData(customEventName) {
  if (Blazor) {
    Blazor.registerCustomEventType(customEventName, {
      browserEventName: 'paste',
      createEventArgs: (event: ClipboardEvent) => {
        return {
          type: event.type,
          pastedData: event.clipboardData.getData('text')
        };
      }
    });
  }
}

export function registerTextFieldOnMouseDown(element, inputElement, callback) {
  element.addEventListener('mousedown', (e: MouseEvent) => {
    const target = e.target;
    const inputDom = getDom(inputElement);
    if (target !== inputDom) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (callback) {
      const mouseEventArgs = {
        Detail: e.detail,
        ScreenX: e.screenX,
        ScreenY: e.screenY,
        ClientX: e.clientX,
        ClientY: e.clientY,
        OffsetX: e.offsetX,
        OffsetY: e.offsetY,
        PageX: e.pageX,
        PageY: e.pageY,
        Button: e.button,
        Buttons: e.buttons,
        CtrlKey: e.ctrlKey,
        ShiftKey: e.shiftKey,
        AltKey: e.altKey,
        MetaKey: e.metaKey,
        Type: e.type
      }

      callback.invokeMethodAsync('Invoke', mouseEventArgs);
    }
  })
}

export function isMobile() {
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4));
}

export function containsActiveElement(selector) {
  var el = getDom(selector);
  if (el && el.contains) {
    return el.contains(document.activeElement);
  }

  return null;
}

export function copyChild(el) {
  if (typeof el === 'string') {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.setAttribute('contenteditable', 'true');
  el.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('copy');
  document.execCommand('unselect');
  el.removeAttribute('contenteditable');
}

export function copyText(text) {
  if (!navigator.clipboard) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
    return;
  }

  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

export function getMenuableDimensions(hasActivator, activatorSelector, attach, contentElement, attached, attachSelector) {
  if (!attached) {
    var container = document.querySelector(attachSelector);
    if (contentElement.nodeType) {
      container.appendChild(contentElement);
    }
  }

  var dimensions = {
    activator: {} as any,
    content: null,
    relativeYOffset: 0,
    offsetParentLeft: 0
  };

  if (hasActivator) {
    var activator = document.querySelector(activatorSelector);
    dimensions.activator = measure(activator, attach)
    dimensions.activator.offsetLeft = activator.offsetLeft
    if (attach !== null) {
      // account for css padding causing things to not line up
      // this is mostly for v-autocomplete, hopefully it won't break anything
      dimensions.activator.offsetTop = activator.offsetTop
    } else {
      dimensions.activator.offsetTop = 0
    }
  }

  sneakPeek(() => {
    if (contentElement) {
      if (contentElement.offsetParent) {
        const offsetRect = getRoundedBoundedClientRect(contentElement.offsetParent)
        dimensions.relativeYOffset = window.pageYOffset + offsetRect.top

        if (hasActivator) {
          dimensions.activator.top -= dimensions.relativeYOffset
          dimensions.activator.left -= window.pageXOffset + offsetRect.left
        } else {
          dimensions.offsetParentLeft = offsetRect.left
        }
      }

      dimensions.content = measure(contentElement, attach)
    }
  }, contentElement);

  return dimensions;
}

function measure(el: HTMLElement, attach) {
  if (!el) return null

  const rect = getRoundedBoundedClientRect(el)

  // Account for activator margin
  if (attach !== null) {
    const style = window.getComputedStyle(el)

    rect.left = parseInt(style.marginLeft!)
    rect.top = parseInt(style.marginTop!)
  }

  return rect
}

function getRoundedBoundedClientRect(el: Element) {
  if (!el || !el.nodeType) {
    return null
  }

  const rect = el.getBoundingClientRect()
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    bottom: Math.round(rect.bottom),
    right: Math.round(rect.right),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
}

function sneakPeek(cb: () => void, el) {
  if (!el || !el.style || el.style.display !== 'none') {
    cb()
    return
  }

  el.style.display = 'inline-block'
  cb()
  el.style.display = 'none'
}

export function invokeMultipleMethod(windowProps, documentProps, hasActivator, activatorSelector, attach, contentElement, attached, attachSelector, element) {
  var multipleResult = {
    windowAndDocument: null,
    dimensions: null,
    zIndex: 0
  };

  multipleResult.windowAndDocument = getWindowAndDocumentProps(windowProps, documentProps);
  multipleResult.dimensions = getMenuableDimensions(hasActivator, activatorSelector, attach, contentElement, attached, attachSelector);
  multipleResult.zIndex = getMenuOrDialogMaxZIndex([contentElement], element);

  return multipleResult;
}

export function registerOTPInputOnInputEvent(elementList, callback) {
  for (let i = 0; i < elementList.length; i++) {
    elementList[i].addEventListener('input', (e: Event) => otpInputOnInputEvent(e, i, elementList, callback));
    elementList[i].addEventListener('focus', (e: Event) => otpInputFocusEvent(e, i, elementList));
    elementList[i].addEventListener('keyup', (e: KeyboardEvent) => otpInputKeyupEvent(e, i, elementList, callback));
  }
}

export function otpInputKeyupEvent(e: KeyboardEvent, otpIdx: number, elementList, callback) {
  e.preventDefault();
  const eventKey = e.key;
  if (eventKey === 'ArrowLeft' || eventKey === 'Backspace') {
    if (eventKey === 'Backspace') {
      const obj = {
        type: eventKey,
        index: otpIdx,
        value: ''
      }
      if (callback) {
        callback.invokeMethodAsync('Invoke', JSON.stringify(obj));
      }
    }
    otpInputFocus(otpIdx - 1, elementList);
  }
  else if (eventKey === 'ArrowRight') {
    otpInputFocus(otpIdx + 1, elementList);
  }
}

export function otpInputFocus(focusIndex: number, elementList) {
  if (focusIndex < 0) {
    otpInputFocus(0, elementList);
  }
  else if (focusIndex >= elementList.length) {
    otpInputFocus(elementList.length - 1, elementList);
  }
  else {
    if (document.activeElement !== elementList[focusIndex]) {
      const element = getDom(elementList[focusIndex])
      element.focus();
    }
  }
}

export function otpInputFocusEvent(e: Event, otpIdx: number, elementList) {
  const element = getDom(elementList[otpIdx]);
  if (element && document.activeElement === element) {
    element.select();
  }
}

export function otpInputOnInputEvent(e: Event, otpIdx: number, elementList, callback) {
  const target = e.target as HTMLInputElement;
  const value = target.value;

  if (value && value !== '') {
    otpInputFocus(otpIdx + 1, elementList);

    if (callback) {
      const obj = {
        type: 'Input',
        index: otpIdx,
        value: value
      }
      callback.invokeMethodAsync('Invoke', JSON.stringify(obj));
    }
  }
}

export function getListIndexWhereAttributeExists(selector: string, attribute:string, value: string) {
  const tiles = document.querySelectorAll(selector);
  if (!tiles) {
    return -1;
  }

  let index = -1;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].getAttribute(attribute) === value) {
      index = i;
      break;
    }
  }

  return index;
}

export function scrollToTile(contentSelector: string, tilesSelector: string, index: number, keyCode: string) {
  var tiles = document.querySelectorAll(tilesSelector)
  if (!tiles) return;

  let tile = tiles[index] as HTMLElement;

  if (!tile) return;

  const content = document.querySelector(contentSelector);
  if (!content) return;

  const scrollTop = content.scrollTop;
  const contentHeight = content.clientHeight;

  if (scrollTop > tile.offsetTop - 8) {
    content.scrollTo({ top: tile.offsetTop - tile.clientHeight, behavior: "smooth" })
  } else if (scrollTop + contentHeight < tile.offsetTop + tile.clientHeight + 8) {
    content.scrollTo({ top: tile.offsetTop - contentHeight + tile.clientHeight * 2, behavior: "smooth" })
  }
}

export function ByIdClick(id: string) {
  document.getElementById(id).click()
}