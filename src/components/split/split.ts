import { ownedWrites } from "../popover/position.js"
import { splitMeasure, splitPixels, splitValue, splitBounds } from "./model.js"
import type { SplitSize } from "./model.js"

export type SplitDirection = "horizontal" | "vertical"
export interface SplitValues {
  size?: SplitSize
  min?: SplitSize
  max?: SplitSize
  direction?: SplitDirection
  disabled?: boolean
  resizeTriggerSize?: number
  step?: number
  coarseStep?: number
}
export interface SplitOptions extends SplitValues { defaultSize?: SplitSize }
export interface SplitState {
  readonly size: SplitSize
  readonly defaultSize: SplitSize
  readonly direction: SplitDirection
  readonly orientation: "vertical" | "horizontal"
  readonly available: number
  readonly pixels: number | null
  readonly minPixels: number | null
  readonly maxPixels: number | null
  readonly ratio: number | null
  readonly disabled: boolean
  readonly dragging: boolean
  readonly pointerSupported: boolean
  readonly status: "ready" | "suspended" | "disconnected"
  readonly reason: "hidden" | "space" | "bounds" | "print" | null
  readonly collapsed: 1 | 2 | null
}
export interface SplitChange {
  readonly size: SplitSize
  readonly state: SplitState
  readonly source: "pointer" | "keyboard" | "cancel"
  readonly event: Event
}
export interface SplitDrag {
  readonly pointerId: number
  readonly cancelled: boolean
  readonly reason: string
  readonly state: SplitState
  readonly event: Event | null
}
export interface SplitController {
  readonly element: HTMLElement
  readonly pane1: HTMLElement
  readonly pane2: HTMLElement
  readonly handle: HTMLElement
  readonly connected: boolean
  readonly error: unknown
  readonly state: SplitState
  readonly size: SplitSize
  set(values: SplitValues): void
  setDefaultSize(size: SplitSize): void
  reset(): void
  refresh(): void
  revealPane(pane: 1 | 2): boolean
  disconnect(): void
}
interface Geometry {
  available: number
  min: number
  max: number
  pixels: number | null
  reason: SplitState["reason"]
  scale: number
  start: number
  gap: number
  rtl: boolean
}
interface Drag {
  id: number
  size: SplitSize
  geometry: Geometry
  offset: number
  started: boolean
  ending: boolean
}
const owner = Symbol.for("markup-ui.split.owner")
type Owned = HTMLElement & { [owner]?: object }
const keys = ["size", "min", "max", "direction", "disabled", "resizeTriggerSize", "step", "coarseStep"]

/** Two original native panes; only separator semantics and numeric grid geometry are owned. */
export function createSplit(element: HTMLElement, options: SplitOptions = {}): SplitController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !element.matches(".mui-split[data-split]")
    || !["div", "section"].includes(element.localName) || (element as Owned)[owner]) throw new TypeError("Use an unowned native div/section.mui-split[data-split].")
  function object(value: unknown, allowed: readonly string[]) {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new TypeError("Unsupported Split configuration.")
  }
  object(options, [...keys, "defaultSize"])
  const children = [...element.children]
  const first = children[0], middle = children[1], last = children[2]
  if (children.length !== 3 || !(first instanceof view.HTMLElement) || !(middle instanceof view.HTMLElement) || !(last instanceof view.HTMLElement)) throw new TypeError("Author pane 1, a hidden handle, and pane 2 as exactly three native children.")
  const pane1 = first, handle = middle, pane2 = last, paneIds = [pane1.id, pane2.id]
  const nodes = [element, pane1, handle, pane2], token = {}, writes = ownedWrites()
  if (!handle.hidden || panesHave("hidden") || panesHave("inert") || nodes.some(node => (node as Owned)[owner])) throw new TypeError("Start with a hidden handle and two unhidden, non-inert, unowned panes.")
  const pointerSupported = typeof view.PointerEvent === "function" && typeof handle.setPointerCapture === "function"
    && typeof handle.releasePointerCapture === "function" && typeof handle.hasPointerCapture === "function"
  const printMedia = typeof view.matchMedia === "function" ? view.matchMedia("print") : null
  let defaults = splitMeasure(options.defaultSize === undefined ? 0.5 : options.defaultSize).size
  let values: Required<SplitValues> = { size: defaults, min: 0, max: 1, direction: "horizontal", disabled: false, resizeTriggerSize: 12, step: 10, coarseStep: 100 }
  let connected = true, writing = false, version = 0, error: unknown = null, drag: Drag | null = null
  let frame = 0, geometryFrame = 0, pending: PointerEvent | null = null
  let resize: ResizeObserver | undefined, observer: MutationObserver | undefined
  let geometry: Geometry = { available: 0, min: 0, max: 0, pixels: null, reason: "space", scale: 1, start: 0, gap: 0, rtl: false }
  const removers: (() => void)[] = []
  function panesHave(name: string) { return pane1.hasAttribute(name) || pane2.hasAttribute(name) }
  function named(node: HTMLElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => document!.getElementById(id)?.textContent?.trim()))
  }
  function ancestry() {
    const result: HTMLElement[] = []
    for (let node: HTMLElement | null = element; node; node = node.parentElement) result.push(node)
    return result
  }
  function validate() {
    if (!element.isConnected || element.getRootNode() !== document || !element.matches(".mui-split[data-split]") || element.hasAttribute("role")
      || element.children.length !== 3 || element.children[0] !== pane1 || element.children[1] !== handle || element.children[2] !== pane2
      || pane1.getAttribute("data-split-pane") !== "1" || pane2.getAttribute("data-split-pane") !== "2" || !handle.hasAttribute("data-split-handle")
      || !["div", "section"].includes(handle.localName) || !named(handle) || handle.hasAttribute("contenteditable")
      || handle.querySelector("button,a[href],input,select,textarea,[tabindex],[contenteditable]")
      || nodes.some(node => node.hasAttribute("is") || (node as Owned)[owner] && (node as Owned)[owner] !== token)
      || [pane1, pane2].some((pane, index) => !["div", "section"].includes(pane.localName)
        || !named(pane) || pane.localName !== "section" && pane.getAttribute("role") !== "region"
        || pane.hasAttribute("role") && pane.getAttribute("role") !== "region"
        || !pane.id || pane.id !== paneIds[index] || /\s/.test(pane.id))
      || pane1.id === pane2.id
      || [...document!.querySelectorAll("[id]")].some(node => node !== pane1 && node.id === pane1.id || node !== pane2 && node.id === pane2.id)) {
      throw new TypeError("Keep two uniquely identified named native regions and their original noninteractive-content handle.")
    }
  }
  function config(input: SplitValues) {
    object(input, keys)
    const next = { ...values, ...input }
    next.size = splitMeasure(next.size).size; next.min = splitMeasure(next.min).size; next.max = splitMeasure(next.max).size
    splitBounds(splitMeasure(next.min), splitMeasure(next.max), 1)
    if (!["horizontal", "vertical"].includes(next.direction) || typeof next.disabled !== "boolean") throw new TypeError("Split direction is horizontal/vertical and disabled is boolean.")
    if (!Number.isFinite(next.resizeTriggerSize) || next.resizeTriggerSize < 1 || next.resizeTriggerSize > 64) throw new RangeError("resizeTriggerSize must be 1..64 CSS pixels.")
    if (![next.step, next.coarseStep].every(value => Number.isFinite(value) && value > 0 && value <= 10000) || next.coarseStep < next.step) throw new RangeError("Keyboard steps must be positive CSS pixels <=10000, with coarseStep >= step.")
    return next
  }
  function px(style: CSSStyleDeclaration, name: string) {
    const value = style.getPropertyValue(name)
    if (!value || value === "normal") return 0
    const number = value.endsWith("px") ? Number(value.slice(0, -2)) : value === "0" ? 0 : NaN
    if (!Number.isFinite(number) || number < 0) throw new TypeError(`Split requires resolved nonnegative pixel ${name}.`)
    return number
  }
  function transforms() {
    for (const node of ancestry()) {
      const style = view!.getComputedStyle(node), transform = style.transform
      if (style.perspective && style.perspective !== "none"
        || style.rotate && !["none", "0deg", "0"].includes(style.rotate)
        || style.translate && style.translate !== "none" && style.translate.trim().split(/\s+/).length > 2) throw new TypeError("Split does not support rotated, perspective or 3D ancestor geometry.")
      if (style.scale && style.scale !== "none") {
        const parts = style.scale.trim().split(/\s+/).map(Number)
        if (parts.length > 2 || parts.some(value => !Number.isFinite(value) || value <= 0)) throw new TypeError("Split scale must be positive and axis-aligned.")
      }
      if (transform && transform !== "none") {
        if (typeof view!.DOMMatrixReadOnly !== "function") throw new TypeError("Transform validation needs native DOMMatrixReadOnly; use untransformed layout.")
        const matrix = new view!.DOMMatrixReadOnly(transform)
        if (!matrix.is2D || Math.abs(matrix.b) > 1e-8 || Math.abs(matrix.c) > 1e-8 || matrix.a <= 0 || matrix.d <= 0) throw new TypeError("Split supports only positive axis-aligned 2D scales/translations, not rotation/skew/3D.")
      }
    }
  }
  function measure(next = values): Geometry {
    validate()
    const style = view!.getComputedStyle(element)
    const hidden = element.closest("[hidden],[inert]") || ancestry().some(node => {
      const value = view!.getComputedStyle(node)
      return value.display === "none" || value.visibility === "hidden"
    })
    if (hidden) return { available: 0, min: 0, max: 0, pixels: null, reason: "hidden", scale: 1, start: 0, gap: 0, rtl: false }
    transforms()
    if (style.writingMode && style.writingMode !== "horizontal-tb" || style.display !== "grid") throw new TypeError("Load Split CSS and keep native grid layout in horizontal-tb writing mode.")
    for (const pane of [pane1, handle, pane2]) {
      const box = view!.getComputedStyle(pane)
      if (["padding-left", "padding-right", "padding-top", "padding-bottom", "border-left-width", "border-right-width", "border-top-width", "border-bottom-width",
        "margin-left", "margin-right", "margin-top", "margin-bottom"].some(name => px(box, name) !== 0)) throw new TypeError("Keep outer pane/handle boxes unpadded/borderless with zero margins; use inner content or non-geometric handle paint.")
      if ([box.transform, box.translate, box.rotate, box.scale].some(value => value && value !== "none" && value !== "1" && value !== "0deg")) throw new TypeError("Do not transform the owned pane/handle boxes; transform inner content instead.")
    }
    const horizontal = next.direction === "horizontal", rtl = horizontal && style.direction === "rtl"
    const rect = element.getBoundingClientRect(), borderSize = horizontal ? element.offsetWidth : element.offsetHeight
    const client = horizontal ? element.clientWidth : element.clientHeight
    const leading = px(style, horizontal ? "padding-left" : "padding-top"), trailing = px(style, horizontal ? "padding-right" : "padding-bottom")
    const gap = px(style, horizontal ? "column-gap" : "row-gap")
    const available = client - leading - trailing - next.resizeTriggerSize - 2 * gap
    if (!borderSize || client <= 0 || available < 2 || !rect.width || !rect.height) return { available: Math.max(0, available), min: 0, max: 0, pixels: null, reason: "space", scale: 1, start: 0, gap, rtl }
    const scale = (horizontal ? rect.width : rect.height) / borderSize
    if (!Number.isFinite(scale) || scale <= 0 || available > 1_000_000) throw new RangeError("Split geometry must be finite, positive and at most 1000000 CSS pixels.")
    const start = horizontal
      ? rect.left + (element.clientLeft + (rtl ? client - trailing : leading)) * scale
      : rect.top + (element.clientTop + leading) * scale
    const bounds = splitBounds(splitMeasure(next.min), splitMeasure(next.max), available)
    return { available, min: bounds.min, max: bounds.max,
      pixels: bounds.feasible ? Math.max(bounds.min, Math.min(bounds.max, splitPixels(splitMeasure(next.size), available))) : null,
      reason: bounds.feasible ? null : "bounds", scale, start, gap, rtl }
  }
  function state(): SplitState {
    const print = printMedia?.matches ?? false, ready = connected && !print && geometry.pixels !== null
    return Object.freeze({ size: values.size, defaultSize: defaults, direction: values.direction,
      orientation: values.direction === "horizontal" ? "vertical" : "horizontal",
      available: geometry.available, pixels: ready ? geometry.pixels : null, minPixels: ready ? geometry.min : null, maxPixels: ready ? geometry.max : null,
      ratio: ready ? geometry.pixels! / geometry.available : null, disabled: values.disabled || !ready || geometry.min === geometry.max,
      dragging: drag !== null, pointerSupported, status: !connected ? "disconnected" : ready ? "ready" : "suspended",
      reason: connected ? print ? "print" : geometry.reason : null,
      collapsed: print ? pane1.hidden ? 1 : pane2.hidden ? 2 : null : ready ? geometry.pixels! < 1 ? 1 : geometry.available - geometry.pixels! < 1 ? 2 : null : null })
  }
  function live() {
    if (!connected) throw new Error("Split is disconnected.")
    if (writing) throw new Error("Split layout writes cannot be reentered; disconnect is allowed.")
  }
  function style(name: string, value: string) {
    if (element.style.getPropertyValue(name) !== value) writes.style(element, name, value)
  }
  function attr(node: HTMLElement, name: string, value: string | null) {
    if (node.getAttribute(name) !== value) writes.attr(node, name, value)
  }
  function apply(next: Geometry) {
    const stamp = version
    writing = true
    try {
      geometry = next
      const value = state(), active = document!.activeElement
      attr(handle, "role", "separator"); attr(handle, "tabindex", "0")
      attr(handle, "aria-label", handle.getAttribute("aria-label"))
      attr(handle, "aria-controls", pane1.id); attr(handle, "aria-orientation", value.orientation)
      attr(element, "data-split-direction", values.direction)
      attr(element, "data-split-layout", value.status)
      attr(element, "data-split-pointer", pointerSupported ? "" : null)
      attr(element, "data-split-disabled", value.disabled ? "" : null)
      style("--mui-split-handle-size", `${values.resizeTriggerSize}px`)
      if (value.status === "ready") { style("--mui-split-first", `${next.pixels}px`); attr(handle, "hidden", null) }
      const losingPane = value.collapsed === 1 ? pane1 : value.collapsed === 2 ? pane2 : null
      if (active instanceof view!.HTMLElement && (losingPane?.contains(active) || value.status !== "ready" && active === handle)) {
        if (value.status === "ready") handle.focus({ preventScroll: true })
        else if (!element.closest("[hidden],[inert]")) { if (!element.hasAttribute("tabindex")) attr(element, "tabindex", "-1"); element.focus({ preventScroll: true }) }
        if (!connected || version !== stamp) throw new Error("Split lifetime changed during focus handoff.")
      }
      if (value.status !== "ready") attr(handle, "hidden", "")
      for (const [index, pane] of [pane1, pane2].entries()) {
        attr(pane, "hidden", value.collapsed === index + 1 ? "" : null)
        attr(pane, "inert", value.collapsed === index + 1 ? "" : null)
      }
      attr(handle, "aria-disabled", value.disabled ? "true" : "false")
      attr(handle, "aria-valuemin", value.status === "ready" ? String(next.min / next.available * 100) : null)
      attr(handle, "aria-valuemax", value.status === "ready" ? String(next.max / next.available * 100) : null)
      attr(handle, "aria-valuenow", value.status === "ready" ? String(next.pixels! / next.available * 100) : null)
      attr(handle, "aria-valuetext", value.status === "ready" ? `${Math.round(next.pixels! / next.available * 1000) / 10}% (${Math.round(next.pixels! * 1000) / 1000}px)` : "Resizing unavailable at this container size")
      error = null
    } finally { writing = false }
  }
  function emit(name: string, detail: SplitChange | SplitDrag | SplitState) {
    element.dispatchEvent(new view!.CustomEvent(name, { bubbles: true, detail }))
  }
  function change(source: SplitChange["source"], event: Event) { emit("mui:split-change", { size: values.size, state: state(), source, event }) }
  function dragEvent(name: string, job: Drag, cancelled: boolean, reason: string, event: Event | null) {
    if (job.started) emit(name, { pointerId: job.id, cancelled, reason, state: state(), event })
  }
  function detach(): Drag | null {
    const job = drag; drag = null
    if (frame) view!.cancelAnimationFrame(frame); frame = 0; pending = null
    if ((element as Owned)[owner] === token) attr(element, "data-split-dragging", null)
    if (job && pointerSupported && handle.hasPointerCapture(job.id)) handle.releasePointerCapture(job.id)
    return job
  }
  function cancel(reason: string, event: Event | null, notify = true) {
    const job = drag
    if (!job || job.ending) return
    if (printMedia?.matches) { pausePrint(notify); return }
    job.ending = true
    const previous = values.size
    values = { ...values, size: job.size }
    apply(measure())
    if (notify && previous !== values.size && event) change("cancel", event)
    if (drag !== job) return
    detach()
    if (notify) dragEvent("mui:split-drag-end", job, true, reason, event)
  }
  function fail(cause: unknown) {
    error = cause; disconnect()
    element.dispatchEvent(new view!.CustomEvent("mui:split-error", { bubbles: true, detail: { error: cause } }))
  }
  function safe(action: () => void) { try { action() } catch (cause) { fail(cause) } }
  function sameGeometry(a: Geometry, b: Geometry) {
    return a.available === b.available && a.scale === b.scale && a.rtl === b.rtl && a.min === b.min && a.max === b.max && a.gap === b.gap && a.reason === b.reason
  }
  function refresh(reason = "refresh", notify = false) {
    live()
    if (printMedia?.matches) { pausePrint(notify); return }
    const next = measure()
    if (drag && !sameGeometry(drag.geometry, next)) cancel(reason, null)
    apply(measure())
    if (notify && connected) emit("mui:split-layout", state())
  }
  function scheduleGeometry() {
    if (!connected || geometryFrame) return
    geometryFrame = view!.requestAnimationFrame(() => { geometryFrame = 0; if (connected) safe(() => refresh("geometry", true)) })
  }
  function userSize(pixels: number, source: "pointer" | "keyboard", event: Event) {
    const next = measure()
    if (next.pixels === null || values.disabled || next.min === next.max) return
    const size = splitValue(Math.max(next.min, Math.min(next.max, pixels)), next.available, splitMeasure(values.size).unit)
    const previous = values.size
    values = { ...values, size }
    apply(measure())
    if (previous !== size && connected) change(source, event)
  }
  function point(event: PointerEvent) {
    const job = drag
    if (!job || job.ending || event.pointerId !== job.id) return
    if (printMedia?.matches) { pausePrint(true); return }
    const next = measure()
    if (!sameGeometry(job.geometry, next) || values.disabled) { cancel("geometry", event); return }
    const coordinate = values.direction === "horizontal" ? event.clientX : event.clientY
    if (!Number.isFinite(coordinate)) throw new TypeError("Pointer coordinates must be finite.")
    const pixels = (next.rtl ? next.start - coordinate : coordinate - next.start) / next.scale - next.gap - job.offset
    userSize(pixels, "pointer", event)
    if (drag === job && connected) dragEvent("mui:split-drag-move", job, false, "pointer", event)
  }
  function pointerDown(event: PointerEvent) {
    if (!pointerSupported || drag || event.button !== 0 || !event.isPrimary || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
    safe(() => {
      refresh()
      if (state().disabled || handle.hidden) return
      const stamp = version
      event.preventDefault(); handle.focus({ preventScroll: true })
      if (!connected || version !== stamp || state().disabled) return
      const box = handle.getBoundingClientRect()
      const offset = values.direction === "horizontal" ? (geometry.rtl ? box.right - event.clientX : event.clientX - box.left) / geometry.scale : (event.clientY - box.top) / geometry.scale
      const job: Drag = { id: event.pointerId, size: values.size, geometry, offset, started: false, ending: false }
      drag = job
      handle.setPointerCapture(job.id)
      if (!connected || drag !== job) return
      attr(element, "data-split-dragging", "")
      job.started = true
      dragEvent("mui:split-drag-start", job, false, "pointer", event)
    })
  }
  function pointerMove(event: PointerEvent) {
    if (!drag || drag.ending || event.pointerId !== drag.id) return
    safe(() => {
      const points = event.getCoalescedEvents?.() ?? []
      pending = points.at(-1) ?? event
      if (!frame) frame = view!.requestAnimationFrame(() => {
        frame = 0
        const sample = pending; pending = null
        if (connected && sample) safe(() => point(sample))
      })
    })
  }
  function pointerUp(event: PointerEvent) {
    const job = drag
    if (!job || job.ending || event.pointerId !== job.id) return
    safe(() => {
      if (frame) view!.cancelAnimationFrame(frame); frame = 0; pending = null
      point(event)
      if (drag !== job) return
      detach(); dragEvent("mui:split-drag-end", job, false, "pointerup", event)
    })
  }
  function keydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return
    if (event.key === "Escape" && drag) { event.preventDefault(); safe(() => cancel("escape", event)); return }
    if (drag) return
    const horizontal = values.direction === "horizontal"
    if (!["Home", "End", ...(horizontal ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"])].includes(event.key)) return
    safe(() => {
      refresh()
      if (state().disabled) return
      event.preventDefault()
      const amount = event.shiftKey ? values.coarseStep : values.step
      const positive = horizontal ? event.key === "ArrowRight" : event.key === "ArrowDown"
      const sign = (positive ? 1 : -1) * (geometry.rtl ? -1 : 1)
      userSize(event.key === "Home" ? geometry.min : event.key === "End" ? geometry.max : geometry.pixels! + sign * amount, "keyboard", event)
    })
  }
  function set(input: SplitValues, reason = "set") {
    live(); validate()
    object(input, keys)
    const next = config({ ...(drag && input.size === undefined ? { size: drag.size } : {}), ...input })
    transforms()
    const job = detach()
    version++; values = next
    try {
      attr(element, "data-split-direction", values.direction)
      if (!printMedia?.matches) apply(measure())
    } catch (cause) { fail(cause); throw cause }
    if (job) dragEvent("mui:split-drag-end", job, true, reason, null)
  }
  function listen(name: string, listener: EventListener) {
    handle.addEventListener(name, listener); removers.push(() => handle.removeEventListener(name, listener))
  }
  function pausePrint(notify = true) {
    const job = detach()
    if (job) {
      values = { ...values, size: job.size }; version++
      dragEvent("mui:split-drag-end", job, true, "print", null)
    }
    if (notify && connected) emit("mui:split-layout", state())
  }
  function printChanged() { if (!connected) return; if (printMedia?.matches) pausePrint(); else scheduleGeometry() }
  function disconnect() {
    if (!connected) return
    const job = drag
    if (job) values = { ...values, size: job.size }
    connected = false; version++
    resize?.disconnect(); observer?.disconnect()
    printMedia?.removeEventListener("change", printChanged)
    if (geometryFrame) view!.cancelAnimationFrame(geometryFrame); geometryFrame = 0
    removers.splice(0).forEach(remove => remove())
    detach(); writes.restore()
    for (const node of nodes) if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
    if (job) dragEvent("mui:split-drag-end", job, true, "disconnect", null)
  }
  try {
    const { defaultSize: ignored, ...initial } = options
    values = config({ direction: (element.getAttribute("data-split-direction") ?? "horizontal") as SplitDirection, ...initial })
    validate()
    for (const node of nodes) (node as Owned)[owner] = token
    attr(element, "data-split-direction", values.direction)
    if (!printMedia?.matches) apply(measure())
    printMedia?.addEventListener("change", printChanged)
    listen("keydown", keydown as EventListener)
    if (pointerSupported) {
      listen("pointerdown", pointerDown as EventListener); listen("pointermove", pointerMove as EventListener); listen("pointerup", pointerUp as EventListener)
      listen("pointercancel", event => { if (drag?.id === (event as PointerEvent).pointerId) safe(() => cancel("pointercancel", event)) })
      listen("lostpointercapture", event => { if (drag?.id === (event as PointerEvent).pointerId && !drag.ending) safe(() => cancel("lostcapture", event)) })
      listen("blur", event => { if (drag && !drag.ending) safe(() => cancel("blur", event)) })
    }
    if (view.ResizeObserver) { resize = new view.ResizeObserver(scheduleGeometry); resize.observe(element) }
    observer = new view.MutationObserver(() => {
      if (!connected) return
      if (!element.isConnected || element.getRootNode() !== document) { disconnect(); return }
      scheduleGeometry()
    })
    for (const node of ancestry()) observer.observe(node, { attributes: true, childList: true, attributeFilter: ["style", "class", "dir", "hidden", "inert"] })
    for (const node of [pane1, pane2, handle]) observer.observe(node, { attributes: true, attributeFilter: ["id", "aria-label", "aria-labelledby", "role", "tabindex", "style", "class"] })
  } catch (cause) { disconnect(); throw cause }
  return {
    element, pane1, pane2, handle,
    get connected() { return connected }, get error() { return error }, get state() { return state() }, get size() { return values.size },
    set,
    setDefaultSize(size) { live(); defaults = splitMeasure(size).size },
    reset() { set({ size: defaults }, "reset") },
    refresh() { try { refresh() } catch (cause) { fail(cause); throw cause } },
    revealPane(pane) {
      live()
      if (pane !== 1 && pane !== 2) throw new TypeError("Pane must be 1 or 2.")
      if (printMedia?.matches) return false
      refresh()
      if (geometry.reason === "hidden" || geometry.reason === "space") return false
      if (state().collapsed !== pane) return true
      const min = Math.max(1, geometry.min), max = Math.min(geometry.available - 1, geometry.max)
      if (min > max) return false
      set({ size: splitValue(Math.max(min, Math.min(max, geometry.available / 2)), geometry.available, splitMeasure(values.size).unit) }, "reveal")
      return state().collapsed !== pane
    },
    disconnect,
  }
}
