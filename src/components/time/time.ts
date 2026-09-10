import { ownedWrites } from "../popover/position.js"
import { formatKeys, formatTime, milliseconds, normalize, object } from "./format.js"
import type { FormattedTime, TimeFormatOptions, TimeInput } from "./format.js"

export interface TimeBindingOptions extends TimeFormatOptions {
  time: TimeInput
  live?: boolean
  clock?: () => number
}
export interface TimeState {
  readonly time: number
  readonly live: boolean
  readonly pending: boolean
  readonly pauseReasons: readonly string[]
  readonly rendered: FormattedTime | null
  readonly error: unknown
}
export interface TimeController {
  readonly element: HTMLTimeElement
  readonly text: Text
  readonly connected: boolean
  readonly state: TimeState
  set(options: Partial<TimeBindingOptions>): void
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.time.owner")
type Owned = HTMLElement & { [owner]?: object }
const liveRegion = '[aria-live]:not([aria-live="off" i]),[role~="alert" i],[role~="status" i],[role~="log" i]'

/** Owns one existing text node and datetime; no role, live region, clock provider or renderer. */
export function createTime(element: HTMLTimeElement, options: TimeBindingOptions): TimeController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLTimeElement) || !element.hasAttribute("data-time")
    || !element.getAttribute("datetime")?.trim() || !element.isConnected || element.getRootNode() !== document
    || (element as Owned)[owner]) throw new TypeError("Use an unowned connected native time[data-time] with an authored datetime fallback.")
  const win = view, doc = document!, token = {}, writes = ownedWrites()
  const targets = [...element.querySelectorAll<HTMLElement>("[data-time-text]")]
  if (targets.length > 1 || element.querySelector("time")) throw new TypeError("Use one explicit text target and no nested time elements.")
  const target = targets[0] ?? element
  if (!["time", "span"].includes(target.localName) || target.childNodes.length !== 1 || target.firstChild?.nodeType !== win.Node.TEXT_NODE
    || !target.textContent?.trim()) throw new TypeError("The time or span[data-time-text] must contain one readable authored Text node; other markup belongs outside that target.")
  const text = target.firstChild as Text, before = text.data
  let lastText = before, connected = true, evaluating = false, version = 0, timer = 0, pending = false
  let rendered: FormattedTime | null = null, error: unknown = null, anchor: number | null = null
  let raw: TimeBindingOptions = options, requestedTime = 0
  const listeners: (() => void)[] = []
  function intact() { return element.isConnected && element.getRootNode() === doc && (target === element || element.contains(target)) && text.parentNode === target && target.childNodes.length === 1 }
  function selected() {
    const selection = doc.getSelection()
    if (!selection || selection.isCollapsed) return false
    for (let i = 0; i < selection.rangeCount; ++i) {
      try { if (selection.getRangeAt(i).intersectsNode(element)) return true } catch { /* Detached selection ranges are not owned. */ }
    }
    return false
  }
  function reasons(next = raw) {
    const result: string[] = []
    if (!intact()) result.push("detached")
    if (doc.hidden) result.push("document-hidden")
    if (selected()) result.push("selection")
    const active = doc.activeElement
    if (active && active !== doc.body && active !== doc.documentElement && (element.contains(active) || active.contains(element))) result.push("focus")
    if (next.live && target.closest(liveRegion)) result.push("live-region")
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      const style = win.getComputedStyle(node)
      if (node.hidden || node.hasAttribute("inert") || style.display === "none" || style.visibility === "hidden"
        || style.contentVisibility === "hidden" || node.localName === "dialog" && !(node as HTMLDialogElement).open
        || node.localName === "details" && !(node as HTMLDetailsElement).open && !node.firstElementChild?.contains(element)) {
        result.push("hidden-element"); break
      }
    }
    return result
  }
  function live() {
    if (!connected) throw new Error("Time is disconnected.")
    if (evaluating) throw new Error("Do not reenter Time from its clock; disconnect is allowed.")
    if (!intact()) { disconnect(); throw new Error("Time's native text anatomy was removed or replaced.") }
  }
  function sample(clock: () => number) {
    const value: unknown = clock()
    if (typeof value !== "number") {
      if (value && typeof (value as PromiseLike<unknown>).then === "function") void Promise.resolve(value).catch(() => {})
      throw new TypeError("clock must synchronously return epoch milliseconds.")
    }
    return milliseconds(value, "milliseconds")
  }
  function copy(value: TimeInput): TimeInput { return typeof value === "number" ? value : new Date(milliseconds(value)) }
  function formatted(next: TimeBindingOptions, reference: number | null) {
    const { time, live: automatic, clock: _clock, ...format } = next
    if ((format.type ?? "datetime") === "relative" && format.to === undefined) {
      format.to = new Date(automatic ? sample(next.clock ?? Date.now) : reference!)
    }
    return formatTime(time, format)
  }
  function prepare(input: Partial<TimeBindingOptions>, initial = false) {
    object(input, [...formatKeys, "time", "live", "clock"])
    const next = { ...(initial ? {} : raw), ...input } as TimeBindingOptions
    if (next.time === undefined || next.live !== undefined && typeof next.live !== "boolean"
      || next.clock !== undefined && typeof next.clock !== "function") throw new TypeError("Provide explicit time and valid live/clock options.")
    next.time = copy(next.time)
    if (next.to !== undefined) next.to = copy(next.to)
    const { time, live: automatic, clock: _clock, ...format } = next
    const normalized = normalize(format), value = milliseconds(time, normalized.unit)
    if (next.dateTime !== undefined) next.dateTime = { ...normalized.dateTime }
    if (automatic && (normalized.type !== "relative" || next.to !== undefined)) throw new TypeError("Live Time requires relative mode and an implicit clock reference, not explicit to.")
    if (automatic && target.closest(liveRegion)) throw new TypeError("Live Time cannot be bound inside an announcing live region.")
    let reference = anchor
    if (normalized.type === "relative" && next.to === undefined && !automatic
      && (initial || reference === null || raw.live || raw.type !== "relative" || Object.hasOwn(input, "to") || Object.hasOwn(input, "clock"))) {
      reference = sample(next.clock ?? Date.now)
    }
    return { next, reference, value, formatted: formatted(next, reference) }
  }
  function stop() { win.clearTimeout(timer); timer = 0 }
  function schedule() {
    stop()
    if (!connected || !raw.live || error || reasons().length || !rendered?.relative) return
    const stamp = version, delay = Math.max(1000, Math.min(2147483647, rendered.relative.nextChangeMs))
    timer = win.setTimeout(() => {
      timer = 0
      if (connected && version === stamp) automaticRefresh()
    }, delay)
  }
  function paint(result: FormattedTime) {
    if (reasons().length) { pending = true; stop(); return }
    const changed = text.data !== result.text || element.getAttribute("datetime") !== result.datetime
    if (element.getAttribute("datetime") !== result.datetime) writes.attr(element, "datetime", result.datetime)
    if (text.data !== result.text) text.data = result.text
    lastText = result.text; rendered = result; error = null; pending = false
    schedule()
    if (changed) element.dispatchEvent(new win.CustomEvent("mui:time-change", { bubbles: true, detail: result }))
  }
  function refresh() {
    live()
    if (reasons().length) { pending = true; stop(); return }
    const stamp = version
    evaluating = true
    let result: FormattedTime
    try { result = formatted(raw, anchor) } finally { evaluating = false }
    if (!connected || version !== stamp) return
    ++version; paint(result)
  }
  function automaticRefresh() {
    try { refresh() } catch (failure) {
      if (!connected) return
      stop(); error = failure; pending = true
      element.dispatchEvent(new win.CustomEvent("mui:time-error", { bubbles: true, detail: Object.freeze({ error: failure }) }))
    }
  }
  function set(input: Partial<TimeBindingOptions>, initial = false) {
    live(); const stamp = version
    evaluating = true
    let result: ReturnType<typeof prepare>
    try { result = prepare(input, initial) } finally { evaluating = false }
    if (!connected || stamp !== version) return
    stop(); ++version; raw = result.next; requestedTime = result.value; anchor = result.reference; error = null
    paint(result.formatted)
  }
  function environment() {
    if (!connected) return
    if (!intact()) { disconnect(); return }
    if (reasons().length) { if (raw.live) pending = true; stop(); return }
    if (raw.live || pending) automaticRefresh()
  }
  function listen(node: EventTarget, type: string, fn: EventListener, capture = false) {
    node.addEventListener(type, fn, capture); listeners.push(() => node.removeEventListener(type, fn, capture))
  }
  const observer = new win.MutationObserver(records => {
    if (!intact()) { disconnect(); return }
    if (records.some(record => record.target instanceof win.Element && (record.target.contains(element) || element.contains(record.target)))) environment()
  })
  function disconnect() {
    if (!connected) return
    connected = false; ++version; stop(); observer.disconnect(); listeners.forEach(remove => remove())
    // Treat machine value and visible text as one lease. An author replacing either
    // half takes responsibility for the pair; never restore just the other half.
    if ((target === element || element.contains(target)) && text.parentNode === target
      && !selected() && text.data === lastText && (!rendered || element.getAttribute("datetime") === rendered.datetime)) {
      writes.restore()
      if (text.data !== before) text.data = before
    }
    if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
    pending = false
  }
  // Validate and format before acquiring ownership or changing the authored fallback.
  evaluating = true
  let initial: ReturnType<typeof prepare>
  try { initial = prepare(options, true) } finally { evaluating = false }
  if (!intact() || !connected) throw new Error("Time was removed during preparation.")
  raw = initial.next; requestedTime = initial.value; anchor = initial.reference
  ;(element as Owned)[owner] = token
  listen(doc, "visibilitychange", environment)
  listen(doc, "selectionchange", environment)
  listen(doc, "focusin", environment)
  listen(doc, "focusout", () => win.queueMicrotask(environment))
  listen(doc, "toggle", environment, true)
  observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "inert", "open", "style", "class", "aria-live", "role"] })
  paint(initial.formatted)
  return {
    element, text, get connected() { return connected },
    get state() { return Object.freeze({ time: requestedTime, live: raw.live ?? false, pending, pauseReasons: Object.freeze(reasons()), rendered, error }) },
    set: input => set(input), refresh, disconnect,
  }
}
