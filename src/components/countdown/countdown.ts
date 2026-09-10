import { ownedWrites } from "../popover/position.js"
import { duration, formatCountdown, precision } from "./format.js"
import type { CountdownDisplay, CountdownPrecision, CountdownTimeInfo } from "./format.js"

export interface CountdownFinish {
  readonly runId: number
  readonly initialValue: number
  readonly value: 0
}
export interface CountdownSettings {
  duration?: number
  value?: number
  active?: boolean
  precision?: CountdownPrecision
  refreshInterval?: number
  format?: ((info: CountdownTimeInfo) => string) | null
  onFinish?: ((finish: CountdownFinish) => void) | null
}
export interface CountdownOptions extends CountdownSettings {
  monotonicNow?: () => number
}
export interface CountdownState {
  readonly runId: number
  readonly duration: number
  readonly value: number
  readonly sampledAt: number
  readonly active: boolean
  readonly status: "running" | "paused" | "finished" | "error" | "disconnected"
  readonly pending: boolean
  readonly pauseReasons: readonly string[]
  readonly rendered: CountdownDisplay | null
  readonly error: unknown
  readonly errorPhase: "clock" | "format" | "finish" | null
}
export interface CountdownController {
  readonly element: HTMLElement
  readonly connected: boolean
  /** A fresh elapsed-clock observation; does not emit completion from a getter. */
  readonly value: number
  readonly state: CountdownState
  set(settings: CountdownSettings): void
  start(): void
  pause(): void
  reset(): void
  refresh(): void
  disconnect(): void
}
type Settings = Omit<Required<CountdownSettings>, "value">
interface Target { element: HTMLElement; text: Text; before: string; last: string }
interface Plan {
  settings: Settings
  now: number
  value: number
  base: number
  started: number
  newRun: boolean
  observedExpiry: boolean
  display: CountdownDisplay
}
const owner = Symbol.for("markup-ui.countdown.owner")
type Owned = HTMLElement & { [owner]?: object }
const keys = ["duration", "value", "active", "precision", "refreshInterval", "format", "onFinish"]
const liveRegion = '[aria-live]:not([aria-live="off" i]),[role~="alert" i],[role~="status" i],[role~="log" i]'

/** Elapsed duration only: one monotonic run, native text and at most one owned timeout. */
export function createCountdown(element: HTMLElement, options: CountdownOptions = {}): CountdownController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !["span", "div", "p", "time"].includes(element.localName)
    || !element.hasAttribute("data-countdown") || !element.isConnected || element.getRootNode() !== document
    || (element as Owned)[owner]) throw new TypeError("Use an unowned connected native span/div/p/time[data-countdown].")
  const win = view, doc = document!, token = {}, writes = ownedWrites()
  if (element.closest(liveRegion)) throw new TypeError("Countdown needs a nonannouncing display; place completion announcements outside it.")
  if (element.localName === "time" && !element.getAttribute("datetime")?.startsWith("P")) throw new TypeError("A native time countdown needs an authored duration datetime fallback, not an instant.")
  function one(selector: string) {
    const nodes = [...element.querySelectorAll<HTMLElement>(selector)]
    if (nodes.length > 1) throw new TypeError(`Use at most one ${selector}.`)
    return nodes[0] ?? null
  }
  const textTarget = one("[data-countdown-text]"), unitNames = ["hours", "minutes", "seconds", "fraction"] as const
  const units = unitNames.map(name => one(`[data-countdown-${name}]`))
  const unitMode = units.some(Boolean)
  if (unitMode && (textTarget || units.some(node => !node))) throw new TypeError("Use either one text target or all four explicit hours/minutes/seconds/fraction text targets.")
  const nodes = unitMode ? units as HTMLElement[] : [textTarget ?? element]
  if (new Set(nodes).size !== nodes.length || element.querySelector("[data-countdown]")) throw new TypeError("Countdown text targets must be distinct and not nested countdown owners.")
  if (element.closest("time[data-time]") || nodes.some(node => node.closest("time[data-time]"))) throw new TypeError("Do not overlap Countdown duration text with Time instant ownership.")
  const targets: Target[] = nodes.map(node => {
    if (node !== element && node.localName !== "span" || node.childNodes.length !== 1
      || node.firstChild?.nodeType !== win.Node.TEXT_NODE || !node.textContent?.trim()
      || node.closest(liveRegion)) throw new TypeError("Every output target must contain one readable authored Text node, not a renderer subtree or live region.")
    const text = node.firstChild as Text
    return { element: node, text, before: text.data, last: text.data }
  })
  function object(value: unknown, allowed: readonly string[]) {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new TypeError("Unsupported Countdown settings.")
  }
  object(options, [...keys, "monotonicNow"])
  if (options.monotonicNow !== undefined && typeof options.monotonicNow !== "function") throw new TypeError("monotonicNow must be a synchronous elapsed-millisecond function.")
  const clock = options.monotonicNow ?? (() => win.performance.now())
  let settings: Settings = { duration: 0, active: true, precision: 0, refreshInterval: 100, format: null, onFinish: null }
  let connected = true, evaluating = false, version = 0, runId = 1, base = 0, started = 0, initialValue = 0
  let lastNow = -1, observedAt = 0, observed = 0, completed = false, pending = false, paintingPaused = false, timer = 0
  let rendered: CountdownDisplay | null = null, planned: CountdownDisplay | null = null, error: unknown = null
  let errorPhase: CountdownState["errorPhase"] = null
  const removers: (() => void)[] = []
  function intact() {
    return element.isConnected && element.getRootNode() === doc && targets.every(target =>
      (target.element === element || element.contains(target.element)) && target.text.parentNode === target.element && target.element.childNodes.length === 1)
  }
  function selected() {
    const selection = doc.getSelection()
    if (!selection || selection.isCollapsed) return false
    for (let i = 0; i < selection.rangeCount; ++i) {
      try { if (selection.getRangeAt(i).intersectsNode(element)) return true } catch { /* Detached ranges are not owned. */ }
    }
    return false
  }
  function reasons() {
    const result: string[] = []
    if (!intact()) result.push("detached")
    if (doc.hidden) result.push("document-hidden")
    if (selected()) result.push("selection")
    const active = doc.activeElement
    if (active && active !== doc.body && active !== doc.documentElement
      && (active === element || active.contains(element) || targets.some(target => target.element.contains(active)))) result.push("focus")
    if (targets.some(target => target.element.closest(liveRegion))) result.push("live-region")
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      const css = win.getComputedStyle(node)
      if (node.hidden || node.hasAttribute("inert") || css.display === "none" || css.visibility === "hidden"
        || css.contentVisibility === "hidden" || node.localName === "dialog" && !(node as HTMLDialogElement).open
        || node.localName === "details" && !(node as HTMLDetailsElement).open && !node.firstElementChild?.contains(element)) {
        result.push("hidden-element"); break
      }
    }
    return result
  }
  function live() {
    if (!connected) throw new Error("Countdown is disconnected.")
    if (evaluating) throw new Error("Do not reenter Countdown from its clock/formatter; disconnect is allowed.")
    if (!intact()) { disconnect(); throw new Error("Countdown's authored text anatomy was removed or replaced.") }
  }
  function consumePromise(value: unknown) {
    if (value && typeof (value as PromiseLike<unknown>).then === "function") {
      void Promise.resolve(value).catch(() => {})
      return true
    }
    return false
  }
  function readClock() {
    const value: unknown = clock()
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
      consumePromise(value)
      throw new TypeError("monotonicNow must return finite nonnegative elapsed milliseconds, not Date/epoch/string/promise values.")
    }
    if (value < lastNow) throw new RangeError("The elapsed clock moved backwards.")
    lastNow = value
    return value
  }
  function remaining(now: number) { return completed ? 0 : settings.active ? Math.max(0, base - (now - started)) : base }
  function format(value: number, next: Settings) {
    const info = formatCountdown(value, next.precision)
    if (!next.format) return info
    const text: unknown = next.format(info)
    if (consumePromise(text) || typeof text !== "string" || !text.trim() || text.length > 512) throw new TypeError("format must synchronously return readable literal text of at most 512 characters.")
    return Object.freeze({ ...info, text })
  }
  function config(input: CountdownSettings): Settings {
    object(input, keys)
    const { value: _value, ...rest } = input
    const next = { ...settings, ...rest }
    duration(next.duration); if (Object.hasOwn(input, "value")) duration(input.value)
    precision(next.precision)
    if (typeof next.active !== "boolean" || !Number.isInteger(next.refreshInterval) || next.refreshInterval < 50 || next.refreshInterval > 60000
      || next.format !== null && typeof next.format !== "function" || next.onFinish !== null && typeof next.onFinish !== "function"
      || unitMode && next.format !== null) throw new TypeError("Use boolean active, refreshInterval 50..60000ms and synchronous functions; custom format is text-mode only.")
    return next
  }
  function prepare(input: CountdownSettings, reset: boolean, initial = false): Plan {
    const stamp = version
    evaluating = true
    try {
      const next = config(input), now = readClock()
      const current = initial ? next.duration : remaining(now)
      const newRun = reset || Object.hasOwn(input, "value")
      const value = Object.hasOwn(input, "value") ? input.value! : reset || initial ? next.duration : current
      const result = format(value, next)
      if (!connected || !intact() || stamp !== version) throw new Error("Countdown was disconnected during preparation.")
      return { settings: next, now, value, base: value, started: now, newRun: newRun && !initial,
        observedExpiry: !initial && !newRun && settings.active && !completed && current <= 0, display: result }
    } finally { evaluating = false }
  }
  function state(): CountdownState {
    return Object.freeze({ runId, duration: settings.duration, value: observed, sampledAt: observedAt,
      active: settings.active, status: !connected ? "disconnected" : errorPhase ? "error" : completed ? "finished" : settings.active ? "running" : "paused",
      pending, pauseReasons: Object.freeze(reasons()), rendered, error, errorPhase })
  }
  function stop() { win.clearTimeout(timer); timer = 0 }
  function schedule(value: number) {
    stop()
    if (!connected || !settings.active || completed || errorPhase) return
    let delay = settings.refreshInterval
    if (value > 0) {
      const quantum = 10 ** (3 - settings.precision), boundary = value - (Math.ceil(value / quantum) - 1) * quantum
      delay = reasons().length ? value : Math.min(value, Math.max(settings.refreshInterval, boundary))
    }
    const stamp = version
    timer = win.setTimeout(() => {
      timer = 0
      if (connected && stamp === version) tick()
    }, Math.max(50, Math.min(2147483647, Math.ceil(delay))))
  }
  function paint(info: CountdownDisplay) {
    if (reasons().length) { pending = true; paintingPaused = true; return false }
    paintingPaused = false
    const values = unitMode ? [String(info.hours).padStart(2, "0"), String(info.minutes).padStart(2, "0"),
      String(info.seconds).padStart(2, "0"), info.precision ? `.${String(info.milliseconds).padStart(3, "0").slice(0, info.precision)}` : ""] : [info.text]
    let changed = false
    if (element.localName === "time" && element.getAttribute("datetime") !== info.datetime) {
      writes.attr(element, "datetime", info.datetime); changed = true
    }
    targets.forEach((target, i) => {
      const value = values[i]!
      if (target.text.data !== value) { target.text.data = value; changed = true }
      target.last = value
    })
    rendered = info; pending = false
    return changed
  }
  function report(failure: unknown, phase: NonNullable<CountdownState["errorPhase"]>, stamp = version, run = runId) {
    if (!connected) return
    if (!intact()) { disconnect(); return }
    if (stamp !== version || run !== runId) {
      if (phase === "finish") element.dispatchEvent(new win.CustomEvent("mui:countdown-error", { bubbles: true, detail: Object.freeze({ error: failure, phase, runId: run, stale: true }) }))
      return
    }
    stop(); error = failure; errorPhase = phase
    if (phase !== "finish") pending = true
    element.dispatchEvent(new win.CustomEvent("mui:countdown-error", { bubbles: true, detail: Object.freeze({ error: failure, phase, runId: run }) }))
  }
  function publish(info: CountdownDisplay, due: boolean) {
    if (!intact()) { disconnect(); return }
    observed = info.remaining; observedAt = lastNow; planned = info; error = null; errorPhase = null
    const finishedNow = due && !completed
    if (finishedNow) completed = true
    const changed = paint(info), stamp = version, run = runId
    schedule(info.remaining)
    if (changed) element.dispatchEvent(new win.CustomEvent("mui:countdown-update", { bubbles: true, detail: state() }))
    if (!intact()) { disconnect(); return }
    if (!connected || stamp !== version || run !== runId || !finishedNow) return
    const detail: CountdownFinish = Object.freeze({ runId: run, initialValue, value: 0 })
    element.dispatchEvent(new win.CustomEvent("mui:countdown-finish", { bubbles: true, detail }))
    if (!intact()) { disconnect(); return }
    if (!connected || stamp !== version || run !== runId) return
    try {
      const result: unknown = settings.onFinish?.(detail)
      if (consumePromise(result)) throw new TypeError("onFinish is a synchronous notification, not an awaited task.")
    } catch (failure) { report(failure, "finish", stamp, run) }
  }
  function apply(input: CountdownSettings, reset = false) {
    live()
    const next = prepare(input, reset)
    stop(); ++version
    settings = next.settings; base = next.base; started = next.started
    if (next.newRun) { ++runId; initialValue = next.value; completed = false }
    publish(next.display, next.observedExpiry)
  }
  function refresh() {
    live()
    const stamp = version
    evaluating = true
    let info: CountdownDisplay
    let phase: NonNullable<CountdownState["errorPhase"]> = "clock"
    try { const now = settings.active && !completed ? readClock() : lastNow; observed = remaining(now); observedAt = now; phase = "format"; info = format(observed, settings) }
    catch (failure) { evaluating = false; report(failure, phase, stamp); throw failure }
    finally { evaluating = false }
    if (!connected || stamp !== version) return
    ++version
    publish(info, settings.active && info.remaining <= 0)
  }
  function tick() {
    if (!connected) return
    if (!intact()) { disconnect(); return }
    const stamp = version
    let phase: NonNullable<CountdownState["errorPhase"]> = "clock"
    evaluating = true
    let info: CountdownDisplay
    try {
      const now = readClock(); observed = remaining(now); observedAt = now
      phase = "format"; info = format(observed, settings)
    } catch (failure) { evaluating = false; report(failure, phase, stamp); return }
    finally { evaluating = false }
    if (!connected || stamp !== version) return
    ++version; publish(info, settings.active && info.remaining <= 0)
  }
  function environment() {
    if (!connected) return
    if (!intact()) { disconnect(); return }
    if (errorPhase) return
    if (reasons().length) {
      const wasPaused = paintingPaused
      paintingPaused = true
      pending = true
      if (wasPaused) return
      if (settings.active && !completed) {
        const stamp = version
        evaluating = true
        try { const now = readClock(); observed = remaining(now); observedAt = now; if (connected && stamp === version) schedule(observed) }
        catch (failure) { evaluating = false; report(failure, "clock", stamp) }
        finally { evaluating = false }
      } else stop()
    } else if (settings.active && !completed && (paintingPaused || pending)) tick()
    else if (pending && planned && paint(planned)) {
      element.dispatchEvent(new win.CustomEvent("mui:countdown-update", { bubbles: true, detail: state() }))
    }
  }
  function listen(node: EventTarget, name: string, fn: EventListener, capture = false) {
    node.addEventListener(name, fn, capture); removers.push(() => node.removeEventListener(name, fn, capture))
  }
  const observer = new win.MutationObserver(records => {
    if (!intact()) { disconnect(); return }
    if (records.some(record => record.target instanceof win.Element && (record.target.contains(element) || element.contains(record.target)))) environment()
  })
  function disconnect() {
    if (!connected) return
    connected = false; ++version; stop(); observer.disconnect(); removers.forEach(remove => remove())
    const own = targets.every(target => (target.element === element || element.contains(target.element))
      && target.text.parentNode === target.element && target.text.data === target.last)
    if (own && !selected() && (element.localName !== "time" || !rendered || element.getAttribute("datetime") === rendered.datetime)) {
      writes.restore()
      targets.forEach(target => { if (target.text.data !== target.before) target.text.data = target.before })
    }
    if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
    pending = false
  }
  const { monotonicNow: _clock, ...initialOptions } = options
  const initial = prepare(initialOptions, false, true)
  settings = initial.settings; base = initial.value; initialValue = initial.value; started = initial.now; observed = initial.value; observedAt = initial.now
  ;(element as Owned)[owner] = token
  listen(doc, "visibilitychange", environment); listen(doc, "selectionchange", environment)
  listen(doc, "focusin", environment); listen(doc, "focusout", () => win.queueMicrotask(environment))
  listen(doc, "toggle", environment, true)
  observer.observe(doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "inert", "open", "style", "class", "role", "aria-live"] })
  publish(initial.display, false)
  return {
    element, get connected() { return connected }, get state() { return state() },
    get value() {
      live()
      if (!settings.active || completed) return completed ? 0 : base
      evaluating = true
      try { return remaining(readClock()) } finally { evaluating = false }
    },
    set: input => apply(input), start: () => apply({ active: true }), pause: () => apply({ active: false }),
    reset: () => apply({}, true), refresh, disconnect,
  }
}
