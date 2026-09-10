import { ownedWrites } from "../popover/position.js"
import { finiteNumber, interpolateNumber, numberFormatter } from "./number.js"
import type { NumberFormatSettings } from "./number.js"

export interface NumberAnimationInfo {
  readonly value: number
  readonly from: number
  readonly to: number
  readonly progress: number
  readonly runId: number
  readonly precision: number
}
export interface NumberAnimationFinish {
  readonly runId: number
  readonly from: number
  readonly to: number
  readonly value: number
}
export interface NumberAnimationSettings extends NumberFormatSettings {
  from?: number
  to?: number
  duration?: number
  active?: boolean
  easing?: "linear" | "ease-out" | ((progress: number) => number)
  format?: ((info: NumberAnimationInfo) => string) | null
  onFinish?: ((finish: NumberAnimationFinish) => void) | null
}
export interface NumberAnimationOptions extends NumberAnimationSettings {
  monotonicNow?: () => number
}
export interface NumberAnimationState {
  readonly runId: number
  readonly from: number
  readonly to: number
  readonly duration: number
  readonly value: number
  readonly progress: number
  readonly active: boolean
  readonly status: "idle" | "playing" | "paused" | "finished" | "cancelled" | "error" | "disconnected"
  readonly pending: boolean
  readonly pauseReasons: readonly string[]
  readonly reducedMotion: boolean
  readonly motionSupported: boolean
  readonly rendered: { readonly value: number; readonly text: string } | null
  readonly error: unknown
  readonly errorPhase: "clock" | "easing" | "format" | "finish" | null
}
export interface NumberAnimationController {
  readonly element: HTMLElement
  readonly text: Text
  readonly connected: boolean
  /** Fresh logical observation; state.value remains the last sampled snapshot. */
  readonly value: number
  readonly state: NumberAnimationState
  set(settings: NumberAnimationSettings): void
  play(): void
  pause(): void
  cancel(): void
  reset(): void
  retarget(to: number, duration?: number): void
  refresh(): void
  disconnect(): void
}
type Settings = Required<NumberAnimationSettings>
type Mode = "idle" | "playing" | "paused" | "finished" | "cancelled"
interface Run {
  id: number
  from: number
  to: number
  duration: number
  elapsed: number
  startedAt: number
  sampledElapsed: number
  mode: Mode
  skipped: boolean
}
interface Sample { value: number; progress: number; elapsed: number; text: string }
const owner = Symbol.for("markup-ui.number-animation.owner")
type Owned = HTMLElement & { [owner]?: object }
const keys = ["from", "to", "duration", "active", "precision", "locale", "showSeparator", "easing", "format", "onFinish"]
const liveRegion = '[aria-live]:not([aria-live="off" i]),[role~="alert" i],[role~="status" i],[role~="log" i]'

/** Native RAF/monotonic interpolation and the existing Time/Countdown-style text lease. */
export function createNumberAnimation(element: HTMLElement, options: NumberAnimationOptions = {}): NumberAnimationController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !["span", "div", "p", "data"].includes(element.localName)
    || !element.hasAttribute("data-number-animation") || !element.isConnected || element.getRootNode() !== document
    || (element as Owned)[owner]) throw new TypeError("Use an unowned connected native span/div/p/data[data-number-animation].")
  const win = view, doc = document!, token = {}, writes = ownedWrites()
  const targets = [...element.querySelectorAll<HTMLElement>("[data-number-text]")]
  if (targets.length > 1 || element.querySelector("[data-number-animation]")) throw new TypeError("Use one explicit number text target, not nested animation owners.")
  const target = targets[0] ?? element
  if (target !== element && target.localName !== "span" || target.childNodes.length !== 1
    || target.firstChild?.nodeType !== win.Node.TEXT_NODE || !target.textContent?.trim()
    || target.closest("[data-countdown],time[data-time]")) throw new TypeError("Use one readable authored Text node, separate from Countdown/Time ownership; no arbitrary child renderer.")
  if (target.closest(liveRegion)) throw new TypeError("Number Animation needs nonannouncing text; completion announcements belong outside it.")
  if (element.localName === "data" && !element.getAttribute("value")?.trim()) throw new TypeError("Author a meaningful native data[value] fallback.")
  const text = target.firstChild as Text, before = text.data
  let lastText = before, connected = true, evaluating = false, version = 0, frame: number | null = null, completionTask = 0
  let lastNow = -1, value = 0, progress = 0, pending = false, blocked: string[] = []
  let rendered: NumberAnimationState["rendered"] = null, planned: Sample | null = null
  let error: unknown = null, errorPhase: NumberAnimationState["errorPhase"] = null
  let settings: Settings = { from: 0, to: 0, duration: 2000, active: true, precision: 0, locale: "en-US", showSeparator: false,
    easing: "ease-out", format: null, onFinish: null }
  let formatter = numberFormatter()
  const media = win.matchMedia?.("(prefers-reduced-motion: reduce)")
  const supported = typeof win.requestAnimationFrame === "function" && typeof win.cancelAnimationFrame === "function"
  let reduced = !media || media.matches
  const removers: (() => void)[] = []
  let run: Run = { id: 1, from: 0, to: 0, duration: 2000, elapsed: 0, startedAt: 0, sampledElapsed: 0, mode: "idle", skipped: false }
  function object(input: unknown, allowed: readonly string[]) {
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !allowed.includes(key))) throw new TypeError("Unsupported Number Animation settings.")
  }
  object(options, [...keys, "monotonicNow"])
  if (options.monotonicNow !== undefined && typeof options.monotonicNow !== "function") throw new TypeError("monotonicNow must be a synchronous elapsed-millisecond function.")
  const clock = options.monotonicNow ?? (() => win.performance.now())
  function consumePromise(result: unknown) {
    if (result && typeof (result as PromiseLike<unknown>).then === "function") { void Promise.resolve(result).catch(() => {}); return true }
    return false
  }
  function now() {
    const result: unknown = clock()
    if (typeof result !== "number" || !Number.isFinite(result) || result < 0 || result > Number.MAX_SAFE_INTEGER) {
      consumePromise(result); throw new TypeError("monotonicNow must return finite nonnegative elapsed milliseconds.")
    }
    if (result < lastNow) throw new RangeError("The animation clock moved backwards.")
    lastNow = result; return result
  }
  function intact() {
    return element.isConnected && element.getRootNode() === doc && (target === element || element.contains(target))
      && text.parentNode === target && target.childNodes.length === 1
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
    if (active && active !== doc.body && active !== doc.documentElement && (active === element || active.contains(element) || target.contains(active))) result.push("focus")
    if (target.closest(liveRegion)) result.push("live-region")
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
    if (!connected) throw new Error("Number Animation is disconnected.")
    if (evaluating) throw new Error("Do not reenter Number Animation from clock/easing/formatter evaluation; disconnect is allowed.")
    if (!intact()) { disconnect(); throw new Error("Number Animation text anatomy was removed or replaced.") }
  }
  function config(input: NumberAnimationSettings) {
    object(input, keys)
    const next = { ...settings, ...input }
    finiteNumber(next.from); finiteNumber(next.to)
    if (!Number.isFinite(next.duration) || next.duration < 0 || next.duration > 3600000
      || typeof next.active !== "boolean" || next.easing !== "linear" && next.easing !== "ease-out" && typeof next.easing !== "function"
      || !Number.isInteger(next.precision) || typeof next.locale !== "string" || typeof next.showSeparator !== "boolean"
      || next.format !== null && typeof next.format !== "function" || next.onFinish !== null && typeof next.onFinish !== "function") {
      throw new TypeError("Use a finite duration 0..3,600,000ms, boolean active and supported synchronous easing/format/finish functions.")
    }
    const nf = numberFormatter({ precision: next.precision, locale: next.locale, showSeparator: next.showSeparator })
    return { settings: next, formatter: nf }
  }
  function eased(p: number, next: Settings) {
    const result: unknown = typeof next.easing === "function" ? next.easing(p) : next.easing === "linear" ? p : 1 - (1 - p) ** 5
    if (consumePromise(result) || typeof result !== "number" || !Number.isFinite(result) || result < 0 || result > 1
      || p === 0 && result !== 0 || p === 1 && result !== 1) throw new RangeError("Easing must synchronously map 0..1 to 0..1 and preserve both endpoints.")
    return result
  }
  function elapsed(at: number, current = run) { return current.mode === "playing" ? current.elapsed + Math.max(0, at - current.startedAt) : current.elapsed }
  function logical(at: number, current = run, next = settings) {
    const time = Math.min(current.duration, elapsed(at, current))
    const p = current.skipped || current.duration === 0 ? 1 : Math.min(1, time / current.duration)
    const fraction = current.skipped ? p : eased(p, next)
    return { value: p === 1 ? current.to : p === 0 ? current.from : interpolateNumber(current.from, current.to, fraction), progress: p, elapsed: time }
  }
  function format(current: { value: number; progress: number }, next = settings, nextRun = run, nf = formatter) {
    finiteNumber(current.value)
    const info: NumberAnimationInfo = Object.freeze({ value: current.value, progress: current.progress, from: nextRun.from, to: nextRun.to, runId: nextRun.id, precision: next.precision })
    const output: unknown = next.format ? next.format(info) : nf.format(current.value)
    if (consumePromise(output) || typeof output !== "string" || !output.trim() || output.length > 2048) throw new TypeError("format must return readable literal text of at most 2048 characters synchronously.")
    return output
  }
  function numeric(value: number) { return Object.is(value, -0) ? "-0" : String(value) }
  function stop() {
    if (frame !== null) win.cancelAnimationFrame(frame)
    win.clearTimeout(completionTask); frame = null; completionTask = 0
  }
  function state(): NumberAnimationState {
    return Object.freeze({ runId: run.id, from: run.from, to: run.to, duration: run.duration, value, progress, active: settings.active,
      status: !connected ? "disconnected" : errorPhase ? "error" : run.mode, pending, pauseReasons: Object.freeze([...blocked]),
      reducedMotion: reduced, motionSupported: supported, rendered, error, errorPhase })
  }
  function paint(sample: Sample) {
    planned = sample
    if (blocked.length) { pending = true; return false }
    let changed = text.data !== sample.text
    if (element.localName === "data" && element.getAttribute("value") !== numeric(sample.value)) {
      writes.attr(element, "value", numeric(sample.value)); changed = true
    }
    if (text.data !== sample.text) text.data = sample.text
    lastText = sample.text; rendered = Object.freeze({ value: sample.value, text: sample.text }); pending = false
    return changed
  }
  function report(failure: unknown, phase: NonNullable<NumberAnimationState["errorPhase"]>, stamp = version, id = run.id) {
    if (!connected) return
    if (!intact()) { disconnect(); return }
    if (stamp !== version || id !== run.id) {
      if (phase === "finish") element.dispatchEvent(new win.CustomEvent("mui:number-animation-error", { bubbles: true, detail: Object.freeze({ error: failure, phase, runId: id, stale: true }) }))
      return
    }
    stop(); error = failure; errorPhase = phase
    if (phase !== "finish") { run.elapsed = run.sampledElapsed; run.mode = "paused"; settings.active = false }
    element.dispatchEvent(new win.CustomEvent("mui:number-animation-error", { bubbles: true, detail: Object.freeze({ error: failure, phase, runId: id }) }))
  }
  function notifyFinish(stamp: number, id: number) {
    if (!connected || version !== stamp || run.id !== id) return
    if (!intact()) { disconnect(); return }
    const detail: NumberAnimationFinish = Object.freeze({ runId: id, from: run.from, to: run.to, value: run.to })
    element.dispatchEvent(new win.CustomEvent("mui:number-animation-finish", { bubbles: true, detail }))
    if (!intact()) { disconnect(); return }
    if (!connected || version !== stamp || run.id !== id) return
    try {
      const result: unknown = settings.onFinish?.(detail)
      if (consumePromise(result)) throw new TypeError("onFinish is a synchronous notification, not an awaited task.")
    } catch (failure) { report(failure, "finish", stamp, id) }
  }
  function schedule() {
    stop()
    if (!connected || blocked.length || errorPhase || run.mode !== "playing") return
    const stamp = version, id = run.id
    if (run.skipped) {
      completionTask = win.setTimeout(() => {
        if (!connected || stamp !== version || id !== run.id || blocked.length) return
        completionTask = 0
        run.mode = "finished"; run.elapsed = run.duration
        notifyFinish(stamp, id)
      }, 16)
    } else frame = win.requestAnimationFrame(() => {
      if (!connected || version !== stamp) return
      frame = null; tick()
    })
  }
  function publish(sample: Sample, finish: boolean) {
    if (!intact()) { disconnect(); return }
    value = sample.value; progress = sample.progress; run.sampledElapsed = sample.elapsed
    if (finish) { run.mode = "finished"; run.elapsed = run.duration }
    const changed = paint(sample), stamp = version, id = run.id
    schedule()
    if (changed) element.dispatchEvent(new win.CustomEvent("mui:number-animation-update", { bubbles: true, detail: state() }))
    if (finish) notifyFinish(stamp, id)
  }
  function tick() {
    if (!connected) return
    if (!intact()) { disconnect(); return }
    if (blocked.length || run.mode !== "playing") { stop(); return }
    reduced = !media || media.matches
    if (reduced) run.skipped = true
    const stamp = version
    let phase: NonNullable<NumberAnimationState["errorPhase"]> = "clock", sample: Sample
    evaluating = true
    try {
      const at = run.skipped ? Math.max(0, lastNow) : now()
      phase = "easing"; const current = logical(at)
      phase = "format"; sample = { ...current, text: format(current) }
    } catch (failure) { evaluating = false; report(failure, phase, stamp); return }
    finally { evaluating = false }
    if (!connected || stamp !== version) return
    ++version; publish(sample, sample.progress === 1)
  }
  function apply(input: NumberAnimationSettings, intent: "set" | "play" | "reset" | "retarget" | "cancel" = "set") {
    live(); const stamp = version
    reduced = !media || media.matches
    evaluating = true
    let next: Settings, nf: Intl.NumberFormat, nextRun: Run, sample: Sample
    try {
      const prepared = config(input); next = prepared.settings; nf = prepared.formatter
      const structural = ["from", "to", "duration", "easing"].some(key => Object.hasOwn(input, key))
      const newRun = intent === "reset" || intent === "retarget" || structural
        || intent === "play" && ["finished", "cancelled"].includes(run.mode)
      const needClock = intent !== "cancel" && (run.mode === "playing" && !run.skipped || !reduced && supported && next.duration > 0 && next.from !== next.to)
      const at = needClock ? now() : Math.max(0, lastNow)
      const current = errorPhase || run.mode === "cancelled" || intent === "cancel" || newRun && intent !== "retarget"
        ? { value, progress, elapsed: run.sampledElapsed } : logical(at)
      if (intent === "retarget") { next.from = current.value; next.active = true }
      if (intent === "play") next.active = true
      if (intent === "cancel") next.active = false
      const skip = reduced || !supported || next.duration === 0 || next.from === next.to
      if (newRun) {
        nextRun = { id: run.id + 1, from: next.from, to: next.to, duration: next.duration, elapsed: 0, sampledElapsed: 0,
          startedAt: at, mode: next.active ? "playing" : "idle", skipped: skip }
      } else {
        nextRun = { ...run, elapsed: current.elapsed, sampledElapsed: current.elapsed, startedAt: at, skipped: run.skipped || skip }
        if (intent === "cancel") nextRun.mode = "cancelled"
        else if (nextRun.mode !== "finished" && nextRun.mode !== "cancelled") nextRun.mode = next.active ? "playing" : nextRun.mode === "idle" ? "idle" : "paused"
        else if (nextRun.mode === "cancelled" && next.active) {
          nextRun = { id: run.id + 1, from: next.from, to: next.to, duration: next.duration, elapsed: 0, sampledElapsed: 0,
            startedAt: at, mode: "playing", skipped: skip }
        }
      }
      const observed = intent === "cancel" || nextRun.mode === "cancelled" ? current : logical(at, nextRun, next)
      sample = { ...observed, text: format(observed, next, nextRun, nf) }
      if (!connected || stamp !== version || !intact()) throw new Error("Number Animation was disconnected during preparation.")
    } finally { evaluating = false }
    stop(); ++version; settings = next!; formatter = nf!; run = nextRun!; error = null; errorPhase = null
    blocked = reasons()
    publish(sample!, false)
  }
  function refresh() {
    live(); blocked = reasons()
    if (blocked.length) { pending = true; stop(); return }
    if (run.mode === "playing" && !errorPhase) tick()
    else if (planned) {
      const stamp = version
      evaluating = true
      let next: Sample
      try { next = { ...planned, text: format(planned) } }
      catch (failure) { evaluating = false; report(failure, "format", stamp); throw failure }
      finally { evaluating = false }
      if (connected && stamp === version) { ++version; publish(next, false) }
    }
  }
  function environment() {
    if (!connected) return
    if (!intact()) { disconnect(); return }
    const wasBlocked = blocked.length > 0
    blocked = reasons()
    if (blocked.length) { pending = true; stop(); return }
    if ((wasBlocked || pending) && !errorPhase) refresh()
  }
  function motion() {
    if (!connected) return
    const stamp = version, id = run.id
    reduced = !media || media.matches
    const settled = run.mode === "finished" || run.mode === "cancelled"
    if (reduced && !settled) run.skipped = true
    environment()
    if (!connected || stamp !== version || id !== run.id) return
    if (!blocked.length && reduced && !errorPhase && !settled) {
      if (run.mode === "playing") tick()
      else {
        try { apply({}) } catch (failure) { report(failure, "format") }
      }
    }
  }
  function listen(node: EventTarget, name: string, callback: EventListener, capture = false) {
    node.addEventListener(name, callback, capture); removers.push(() => node.removeEventListener(name, callback, capture))
  }
  const observer = new win.MutationObserver(records => {
    if (!intact()) { disconnect(); return }
    if (records.some(record => record.target instanceof win.Element && (record.target.contains(element) || element.contains(record.target)))) environment()
  })
  function disconnect() {
    if (!connected) return
    connected = false; ++version; stop(); observer.disconnect(); removers.forEach(remove => remove())
    if ((target === element || element.contains(target)) && text.parentNode === target && text.data === lastText && !selected()
      && (element.localName !== "data" || !rendered || element.getAttribute("value") === numeric(rendered.value))) {
      writes.restore(); if (text.data !== before) text.data = before
    }
    if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
    pending = false
  }
  const { monotonicNow: _clock, ...initialOptions } = options
  evaluating = true
  let initial: Sample
  try {
    const prepared = config(initialOptions); settings = prepared.settings; formatter = prepared.formatter
    run = { id: 1, from: settings.from, to: settings.to, duration: settings.duration, elapsed: 0, sampledElapsed: 0,
      startedAt: 0, mode: settings.active ? "playing" : "idle", skipped: reduced || !supported || settings.duration === 0 || settings.from === settings.to }
    if (!run.skipped) run.startedAt = now()
    const current = logical(run.startedAt); initial = { ...current, text: format(current) }
  } finally { evaluating = false }
  if (!intact() || !connected) throw new Error("Number Animation was removed during preparation.")
  ;(element as Owned)[owner] = token
  listen(doc, "visibilitychange", environment); listen(doc, "selectionchange", environment)
  listen(doc, "focusin", environment); listen(doc, "focusout", () => win.queueMicrotask(environment))
  listen(doc, "toggle", environment, true); listen(win, "resize", environment)
  if (media) listen(media, "change", motion)
  observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "inert", "open", "style", "class", "role", "aria-live"] })
  blocked = reasons(); publish(initial!, false)
  return {
    element, text, get connected() { return connected }, get state() { return state() },
    get value() {
      live()
      if (run.mode !== "playing" || errorPhase) return value
      evaluating = true
      try { return logical(run.skipped ? Math.max(0, lastNow) : now()).value } finally { evaluating = false }
    },
    set: input => apply(input),
    play() { live(); if (run.mode !== "playing" || errorPhase) apply({}, "play") },
    pause: () => apply({ active: false }), cancel: () => apply({}, "cancel"), reset: () => apply({}, "reset"),
    retarget(to, duration) { finiteNumber(to); apply(duration === undefined ? { to } : { to, duration }, "retarget") },
    refresh, disconnect,
  }
}
