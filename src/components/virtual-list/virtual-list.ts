import { MAX_VIEWPORT_HEIGHT, virtualWindow } from "./window.js"

export type VirtualListKey = string | number
export interface VirtualListContext { readonly key: VirtualListKey; readonly index: number }
export interface VirtualListOptions<T> {
  items: readonly T[]
  rowSize: number
  overscan?: number
  key: (item: T, index: number) => VirtualListKey
  render: (item: T, context: VirtualListContext) => HTMLLIElement
  update: (element: HTMLLIElement, item: T, context: VirtualListContext) => void
  dispose?: (element: HTMLLIElement, context: VirtualListContext) => void
}
export interface VirtualListScrollOptions {
  index?: number
  key?: VirtualListKey
  position?: "top" | "bottom"
  top?: number
  align?: "start" | "center" | "end" | "nearest"
}
export interface VirtualListState {
  readonly count: number
  readonly start: number
  readonly end: number
  readonly mounted: number
  readonly pinnedKey: VirtualListKey | null
}
export interface VirtualListController<T> {
  readonly viewport: HTMLElement
  readonly list: HTMLUListElement | HTMLOListElement
  readonly connected: boolean
  readonly error: unknown
  readonly state: VirtualListState
  setItems(items: readonly T[]): void
  scrollTo(options: VirtualListScrollOptions): void
  refresh(): void
  disconnect(): void
}
interface Row<T> {
  element: HTMLLIElement
  item: T
  context: VirtualListContext
  original: { top: string; priority: string; classed: boolean; position: string | null; size: string | null }
}
const owner = Symbol.for("markup-ui.virtual-list.owner")
type Owned = Element & { [owner]?: object }

/** An explicit native fixed-height window. Item binding and remountable state belong to the caller. */
export function createVirtualList<T>(viewport: HTMLElement, options: VirtualListOptions<T>): VirtualListController<T> {
  const document = viewport?.ownerDocument, view = document?.defaultView
  if (!view || !(viewport instanceof view.HTMLElement) || !viewport.isConnected
    || viewport.getRootNode() !== document
    || !["div", "section"].includes(viewport.localName)
    || !viewport.classList.contains("mui-virtual-list")) throw new TypeError("Use a connected native div/section.mui-virtual-list viewport.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["items", "rowSize", "overscan", "key", "render", "update", "dispose"].includes(key))
    || typeof options.key !== "function" || typeof options.render !== "function" || typeof options.update !== "function"
    || options.dispose !== undefined && typeof options.dispose !== "function") {
    throw new TypeError("Provide items, rowSize, key, render and an explicit update hook.")
  }
  if ((viewport as Owned)[owner]) throw new Error("Virtual List already has an owner.")
  const children = [...viewport.children]
  const listNode = children[0]
  if (children.length !== 1 || !(listNode instanceof view.HTMLUListElement || listNode instanceof view.HTMLOListElement)
    || !listNode.classList.contains("mui-virtual-list__items") || listNode.childNodes.length && listNode.textContent?.trim()
    || listNode.children.length || listNode.hasAttribute("role") && listNode.getAttribute("role") !== "list"
    || viewport.hasAttribute("role")) {
    throw new TypeError("Author one empty native ul/ol.mui-virtual-list__items; keep fallback content outside the viewport.")
  }
  const list = listNode
  const rowSize = options.rowSize, overscan = options.overscan === undefined ? 3 : options.overscan
  const keyOf = options.key, render = options.render, update = options.update, dispose = options.dispose
  const token = {}
  if ((viewport as Owned)[owner] || (list as Owned)[owner]) throw new Error("Virtual List already has an owner.")
  let connected = true, busy = false, frame = 0, error: unknown = null
  let items: T[] = [], keys: VirtualListKey[] = [], indices = new Map<VirtualListKey, number>()
  let rows = new Map<VirtualListKey, Row<T>>()
  const owned = new Set<Row<T>>()
  let state: VirtualListState = Object.freeze({ count: 0, start: 0, end: 0, mounted: 0, pinnedKey: null })
  const originalHeight = list.style.getPropertyValue("height"), heightPriority = list.style.getPropertyPriority("height")
  const originalSize = viewport.style.getPropertyValue("--mui-virtual-row-size"), sizePriority = viewport.style.getPropertyPriority("--mui-virtual-row-size")
  const originalTabindex = viewport.getAttribute("tabindex")
  let lastHeight: string | null = null, lastSize: string | null = null, leasedTabindex = false
  let observer: ResizeObserver | undefined

  function synchronous(result: unknown) {
    if (result && (typeof result === "object" || typeof result === "function")
      && typeof (result as { then?: unknown }).then === "function") {
      void Promise.resolve(result).catch(() => {})
      throw new TypeError("Virtual List hooks must be synchronous; promises are unsupported.")
    }
  }
  function validate(data: readonly T[]) {
    if (!Array.isArray(data)) throw new TypeError("items must be an array.")
    virtualWindow(data.length, rowSize, 0, 0, overscan)
    const copy = [...data], nextKeys: VirtualListKey[] = [], nextIndices = new Map<VirtualListKey, number>()
    copy.forEach((item, index) => {
      const key = keyOf(item, index)
      synchronous(key)
      check()
      if (!(typeof key === "string" && key.length > 0 && key.length <= 256 || typeof key === "number" && Number.isFinite(key))) {
        throw new TypeError("Use stable nonempty string keys (at most 256 characters) or finite numeric keys.")
      }
      if (nextIndices.has(key)) throw new TypeError("Virtual List keys must be unique.")
      nextKeys.push(key); nextIndices.set(key, index)
    })
    return { copy, nextKeys, nextIndices }
  }
  function geometry() {
    if (!viewport.isConnected || viewport.getRootNode() !== document
      || !viewport.classList.contains("mui-virtual-list") || !list.classList.contains("mui-virtual-list__items")
      || list.parentElement !== viewport || viewport.children.length !== 1
      || [...list.children].some(element => ![...owned].some(row => row.element === element))
      || [...rows.values()].some(row => row.element.parentElement !== list)) throw new Error("Keep the connected, exclusively owned list anatomy.")
    const style = view!.getComputedStyle(viewport)
    const size = style.getPropertyValue("--mui-virtual-list-height").trim()
    if (!/^(?:\d+(?:\.\d+)?|\.\d+)px$/.test(size) || Number.parseFloat(size) <= 0
      || Number.parseFloat(size) > MAX_VIEWPORT_HEIGHT || !["auto", "scroll"].includes(style.overflowY)
      || [style.paddingTop, style.paddingBottom].some(value => Number.parseFloat(value || "0") !== 0)) {
      throw new Error("Load the stylesheet and set --mui-virtual-list-height to a positive CSS-pixel length up to 16384px.")
    }
    return virtualWindow(items.length, rowSize, viewport.clientHeight, viewport.scrollTop, overscan)
  }
  function cancel() { if (frame) view!.cancelAnimationFrame(frame); frame = 0 }
  function focusRow() {
    const active = document!.activeElement
    return [...rows.values()].find(row => active && row.element.contains(active))
  }
  function release(row: Row<T>, errors: unknown[]) {
    if (!owned.delete(row)) return
    try { synchronous(dispose?.(row.element, row.context)) } catch (cause) { errors.push(cause) }
    finally {
      row.element.remove()
      if (row.original.top) row.element.style.setProperty("top", row.original.top, row.original.priority)
      else row.element.style.removeProperty("top")
      if (!row.original.classed) row.element.classList.remove("mui-virtual-list__row")
      for (const [name, value] of [["aria-posinset", row.original.position], ["aria-setsize", row.original.size]]) {
        if (value === null) row.element.removeAttribute(name!)
        else row.element.setAttribute(name!, value!)
      }
      if ((row.element as Owned)[owner] === token) delete (row.element as Owned)[owner]
    }
  }
  function stop(cause?: unknown, failed = false) {
    const errors: unknown[] = failed ? [cause] : []
    if (connected) {
      connected = false; cancel(); observer?.disconnect()
      viewport.removeEventListener("scroll", schedule)
      viewport.removeEventListener("focusout", schedule)
      if (focusRow() && viewport.isConnected) viewport.focus({ preventScroll: true })
      for (const row of owned) release(row, errors)
      rows.clear()
      if (lastHeight !== null && list.style.getPropertyValue("height") === lastHeight) {
        if (originalHeight) list.style.setProperty("height", originalHeight, heightPriority)
        else list.style.removeProperty("height")
      }
      if (lastSize !== null && viewport.style.getPropertyValue("--mui-virtual-row-size") === lastSize) {
        if (originalSize) viewport.style.setProperty("--mui-virtual-row-size", originalSize, sizePriority)
        else viewport.style.removeProperty("--mui-virtual-row-size")
      }
      if (leasedTabindex && viewport.getAttribute("tabindex") === "0") {
        if (originalTabindex === null) viewport.removeAttribute("tabindex")
        else viewport.setAttribute("tabindex", originalTabindex)
      }
      for (const node of [viewport, list]) if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
      items = []; keys = []; indices.clear()
      state = Object.freeze({ count: 0, start: 0, end: 0, mounted: 0, pinnedKey: null })
    }
    // A factory may disconnect its controller before returning a newly allocated row.
    for (const row of owned) release(row, errors)
    if (errors.length) {
      error = errors.length === 1 ? errors[0] : new AggregateError(errors, "Virtual List operation/cleanup failed.")
      viewport.dispatchEvent(new view!.CustomEvent("mui:virtual-list-error", { detail: { error } }))
      throw error
    }
  }
  function live() { if (!connected) throw new Error("Virtual List is disconnected.") }
  function guard() { live(); if (busy) throw new Error("Virtual List callbacks may not reenter operations; disconnect is allowed.") }
  function check() { live() }
  function eligible(element: HTMLLIElement) {
    if (!(element instanceof view!.HTMLLIElement) || element.ownerDocument !== document
      || element.parentNode || element.isConnected || (element as Owned)[owner]
      || element.hasAttribute("is") || element.hasAttribute("role")) throw new TypeError("render must return a fresh, detached, unowned native li without a role override.")
  }
  function place(elements: HTMLLIElement[], anchor: ChildNode | null) {
    for (let index = elements.length - 1; index >= 0; index--) {
      const element = elements[index]!
      if (element.parentNode !== list || element.nextSibling !== anchor) {
        const movable = list as typeof list & { moveBefore?: (node: Node, child: Node | null) => void }
        if (element.parentNode === list && movable.moveBefore) movable.moveBefore(element, anchor)
        else list.insertBefore(element, anchor)
        check()
      }
      anchor = element
    }
  }
  function paint(forceUpdate: boolean) {
    const window = geometry(), focused = focusRow()
    if (focused && !indices.has(focused.context.key)) {
      viewport.focus({ preventScroll: true }); check()
      if (focused.element.contains(document!.activeElement)) throw new Error("Cannot safely remove the focused key; focus the viewport first.")
    }
    const pin = focused && indices.has(focused.context.key) ? focused : undefined
    const wanted = keys.slice(window.start, window.end)
    const pinIndex = pin ? indices.get(pin.context.key)! : -1
    if (pin && (pinIndex < window.start || pinIndex >= window.end)) wanted.push(pin.context.key)
    wanted.sort((a, b) => indices.get(a)! - indices.get(b)!)
    const next = new Map<VirtualListKey, Row<T>>()
    for (const key of wanted) {
      const index = indices.get(key)!, item = items[index]!, context = Object.freeze({ key, index })
      let row = rows.get(key)
      if (!row) {
        const element = render(item, context)
        synchronous(element)
        eligible(element)
        row = { element, item, context, original: {
          top: element.style.getPropertyValue("top"), priority: element.style.getPropertyPriority("top"),
          classed: element.classList.contains("mui-virtual-list__row"),
          position: element.getAttribute("aria-posinset"), size: element.getAttribute("aria-setsize"),
        } }
        owned.add(row); (element as Owned)[owner] = token
        check()
      } else if (forceUpdate || row.context.index !== index) {
        synchronous(update(row.element, item, context)); check()
        if (row.element.parentElement !== list) throw new Error("update may not remove or transfer an owned row.")
        row.item = item; row.context = context
      }
      next.set(key, row)
    }
    list.style.setProperty("height", `${window.total}px`)
    lastHeight = list.style.getPropertyValue("height")
    viewport.style.setProperty("--mui-virtual-row-size", `${rowSize}px`)
    lastSize = viewport.style.getPropertyValue("--mui-virtual-row-size")
    const errors: unknown[] = []
    for (const [key, row] of rows) if (!next.has(key)) { release(row, errors); check() }
    if (errors.length) throw new AggregateError(errors, "Virtual List disposal failed.")
    const elements = [...next.values()].map(row => {
      row.element.classList.add("mui-virtual-list__row")
      row.element.style.top = `${row.context.index * rowSize}px`
      row.element.setAttribute("aria-posinset", String(row.context.index + 1))
      row.element.setAttribute("aria-setsize", String(items.length))
      return row.element
    })
    if (pin && next.has(pin.context.key)) {
      const pivot = elements.indexOf(pin.element)
      place(elements.slice(0, pivot), pin.element)
      place(elements.slice(pivot + 1), null)
    } else place(elements, null)
    rows = next
    if (viewport.clientHeight && (Math.abs(list.offsetHeight - window.total) > 1
      || Math.abs(viewport.scrollHeight - Math.max(viewport.clientHeight, window.total)) > 1)) {
      throw new RangeError("Native scroll extent differs from fixed-size geometry; check CSS overrides and browser/zoom limits.")
    }
    viewport.scrollTop = window.offset
    state = Object.freeze({ count: items.length, start: window.start, end: window.end,
      mounted: rows.size, pinnedKey: pin && (pinIndex < window.start || pinIndex >= window.end) ? pin.context.key : null })
  }
  function operate(action: () => void) {
    guard(); cancel(); busy = true
    try { action(); check() }
    catch (cause) { stop(cause, true) }
    finally { busy = false }
  }
  function refresh() { operate(() => paint(false)) }
  function schedule() {
    if (!connected || frame) return
    frame = view!.requestAnimationFrame(() => {
      frame = 0
      try { refresh() } catch { /* Direct APIs throw; scheduled failures already report and disconnect. */ }
    })
  }
  function setItems(data: readonly T[]) {
    guard()
    // Full key validation precedes any native mutation. Reentrant key callbacks are rejected.
    busy = true
    let next: ReturnType<typeof validate>
    try { next = validate(data); check() } finally { busy = false }
    operate(() => {
      items = next.copy; keys = next.nextKeys; indices = next.nextIndices
      paint(true)
    })
  }
  function scrollTo(options: VirtualListScrollOptions) {
    guard()
    if (!options || typeof options !== "object" || Array.isArray(options)
      || Object.keys(options).some(key => !["index", "key", "position", "top", "align"].includes(key))
      || ["index", "key", "position", "top"].filter(key => Object.hasOwn(options, key)).length !== 1
      || options.align !== undefined && !["start", "center", "end", "nearest"].includes(options.align)) throw new TypeError("Specify exactly one index, key, position or top, and an optional item alignment.")
    const height = viewport.clientHeight, max = Math.max(0, items.length * rowSize - height)
    let top: number
    if (Object.hasOwn(options, "index") || Object.hasOwn(options, "key")) {
      const index = Object.hasOwn(options, "key") ? indices.get(options.key!) : options.index
      if (index === undefined || !Number.isInteger(index) || index < 0 || index >= items.length) throw new RangeError("Unknown key or invalid item index.")
      top = index * rowSize
      const align = options.align ?? "start", current = Math.max(0, Math.min(max, viewport.scrollTop))
      if (align === "center") top -= (height - rowSize) / 2
      if (align === "end") top -= height - rowSize
      if (align === "nearest") {
        if (top >= current && top + rowSize <= current + height
          || top <= current && top + rowSize >= current + height) top = current
        else if (top > current && rowSize <= height || top < current && rowSize > height) top -= height - rowSize
      }
    } else {
      if (options.align !== undefined) throw new TypeError("Alignment requires an index or key.")
      if (Object.hasOwn(options, "position")) {
        if (!["top", "bottom"].includes(options.position!)) throw new TypeError("position is top or bottom.")
        top = options.position === "top" ? 0 : max
      } else {
        if (typeof options.top !== "number" || !Number.isFinite(options.top)) throw new TypeError("top must be finite.")
        top = options.top
      }
    }
    operate(() => { geometry(); viewport.scrollTop = Math.max(0, Math.min(max, top)); paint(false) })
  }
  const controller: VirtualListController<T> = {
    viewport, list,
    get connected() { return connected }, get error() { return error }, get state() { return state },
    setItems, scrollTo, refresh, disconnect: () => stop(),
  }
  try {
    for (const node of [viewport, list]) (node as Owned)[owner] = token
    busy = true
    const initial = validate(options.items); check()
    items = initial.copy; keys = initial.nextKeys; indices = initial.nextIndices
    geometry()
    if (originalTabindex === null) { viewport.setAttribute("tabindex", "0"); leasedTabindex = true }
    paint(false)
    viewport.addEventListener("scroll", schedule, { passive: true })
    viewport.addEventListener("focusout", schedule)
    if (view.ResizeObserver) { observer = new view.ResizeObserver(schedule); observer.observe(viewport) }
    busy = false
  } catch (cause) { stop(cause, true) }
  return controller
}
