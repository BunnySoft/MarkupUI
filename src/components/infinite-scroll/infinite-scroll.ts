import { ownedWrites } from "../popover/position.js"

export interface InfiniteScrollSettings {
  scrollRoot?: HTMLElement | null
  distance?: number
  disabled?: boolean
  hasMore?: boolean
  automatic?: boolean
  automaticLimit?: number
}
export interface InfiniteScrollContext {
  readonly signal: AbortSignal
  readonly generation: number
  readonly reason: "manual" | "automatic"
  isCurrent(): boolean
}
export interface InfiniteScrollResult {
  added: number
  hasMore: boolean
  commit?: () => void
}
export interface InfiniteScrollOptions extends InfiniteScrollSettings {
  load: (context: InfiniteScrollContext) => InfiniteScrollResult | Promise<InfiniteScrollResult>
}
export type InfiniteScrollOutcome =
  | { readonly status: "loaded"; readonly added: number; readonly hasMore: boolean }
  | { readonly status: "error"; readonly error: unknown }
  | { readonly status: "aborted"; readonly reason: unknown; readonly cause?: unknown }
export type InfiniteScrollPhase = "idle" | "loading" | "cancelling" | "error" | "finished" | "disabled" | "paused" | "disconnected"
export interface InfiniteScrollState {
  readonly phase: InfiniteScrollPhase
  readonly pending: boolean
  readonly disabled: boolean
  readonly hasMore: boolean
  readonly intersecting: boolean
  readonly automatic: boolean
  readonly supported: boolean
  readonly automaticUsed: number
  readonly automaticLimit: number
  readonly lastAdded: number
  readonly generation: number
  readonly pauseReason: "manual" | "unsupported" | "limit" | "entry" | "no-progress" | null
}
export interface InfiniteScrollController {
  readonly element: HTMLElement
  readonly content: HTMLElement
  readonly sentinel: HTMLElement
  readonly scrollRoot: HTMLElement | null
  readonly connected: boolean
  readonly error: unknown
  readonly state: InfiniteScrollState
  load(): Promise<InfiniteScrollOutcome>
  set(settings: InfiniteScrollSettings): void
  reset(options?: { hasMore?: boolean }): void
  refresh(): void
  disconnect(): void
}
interface Job {
  abort: AbortController
  generation: number
  reason: InfiniteScrollContext["reason"]
  promise: Promise<InfiniteScrollOutcome>
  resolve: (outcome: InfiniteScrollOutcome) => void
}
const owner = Symbol.for("markup-ui.infinite-scroll.owner")
type Owned = Element & { [owner]?: object }
const settingKeys = ["scrollRoot", "distance", "disabled", "hasMore", "automatic", "automaticLimit"]
const messageNames = ["loading", "cancelling", "error", "finished", "disabled", "paused"] as const

/** Owns load permission/lifetime, never the application's items or transport. */
export function createInfiniteScroll(element: HTMLElement, options: InfiniteScrollOptions): InfiniteScrollController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !element.matches(".mui-infinite-scroll[data-infinite-scroll]")
    || !["div", "section"].includes(element.localName) || (element as Owned)[owner]) throw new TypeError("Use an unowned native div/section.mui-infinite-scroll[data-infinite-scroll].")
  const token = {}, writes = ownedWrites(), supported = typeof view.IntersectionObserver === "function"
  function object(value: unknown, keys: readonly string[]) {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !keys.includes(key))) throw new TypeError("Unsupported Infinite Scroll configuration.")
  }
  object(options, [...settingKeys, "load"])
  if (typeof options.load !== "function") throw new TypeError("Provide an explicit application load callback.")
  const loader = options.load
  const own = (node: Element) => node.closest("[data-infinite-scroll]") === element
  function find(selector: string) { return [...element.querySelectorAll<HTMLElement>(selector)].filter(own) }
  function one(selector: string) {
    const nodes = find(selector)
    if (nodes.length !== 1) throw new TypeError(`Author exactly one ${selector}.`)
    return nodes[0]!
  }
  const content = one("[data-infinite-content]"), sentinel = one("[data-infinite-sentinel]"), buttonNode = one("[data-infinite-load]")
  if (!(buttonNode instanceof view.HTMLButtonElement)) throw new TypeError("Manual loading needs a native button.")
  const button = buttonNode
  const messages = new Map<string, HTMLElement>(messageNames.map(name => [name, one(`[data-infinite-message="${name}"]`)]))
  const nodes = [element, content, sentinel, button, ...messages.values()]
  if (new Set(nodes).size !== nodes.length) throw new TypeError("Infinite Scroll anatomy nodes must be distinct.")
  if (button.getAttribute("aria-disabled") === "true") throw new TypeError("Use native disabled or settings.disabled; enhancement aria-disabled is reserved.")
  let settings: Required<InfiniteScrollSettings> = { scrollRoot: null, distance: 0, disabled: false, hasMore: true, automatic: true, automaticLimit: 3 }
  let connected = true, applying = false, generation = 0, observerVersion = 0
  let intersection: IntersectionObserver | undefined, nativeObserver: MutationObserver | undefined
  let flight: Job | null = null, failure: { error: unknown } | null = null
  let intersecting = false, entryUsed = false, stalled = false, automaticUsed = 0, lastAdded = 0, lastState = ""
  let nativeDisabled = false
  const originalBusy = content.getAttribute("aria-busy"), originalAriaDisabled = button.getAttribute("aria-disabled")
  function named(node: HTMLElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => document!.getElementById(id)?.textContent?.trim()))
  }
  function available(node: HTMLElement) {
    if (!node.isConnected || node.ownerDocument !== document || node.getRootNode() !== document || node.closest("[hidden],[inert]")) return false
    for (let current: HTMLElement | null = node; current; current = current.parentElement) {
      const style = view!.getComputedStyle(current)
      if (style.display === "none" || style.visibility === "hidden") return false
      if (current.localName === "details" && !(current as HTMLDetailsElement).open && !current.firstElementChild?.contains(node)) return false
    }
    return true
  }
  function blocked() {
    return button.matches(":disabled") || !button.parentElement || !available(button.parentElement)
      || !available(element) || !available(content) || !available(sentinel) || button.closest("[inert]") !== null
  }
  function validate(next: Required<InfiniteScrollSettings>) {
    if (!element.isConnected || element.getRootNode() !== document || !element.matches(".mui-infinite-scroll[data-infinite-scroll]")
      || element.hasAttribute("role") && element.getAttribute("role") !== "region"
      || nodes.some(node => node !== element && (!element.contains(node) || !own(node)))
      || nodes.some(node => (node as Owned)[owner] && (node as Owned)[owner] !== token)
      || one("[data-infinite-content]") !== content || one("[data-infinite-sentinel]") !== sentinel || one("[data-infinite-load]") !== button
      || content === sentinel.parentElement || content.contains(sentinel) || content.parentElement !== sentinel.parentElement
      || !(content.compareDocumentPosition(sentinel) & view!.Node.DOCUMENT_POSITION_FOLLOWING)
      || content.contains(button) || content.localName === "template"
      || !["div", "span"].includes(sentinel.localName) || sentinel.childNodes.length || sentinel.getAttribute("aria-hidden") !== "true"
      || sentinel.hasAttribute("tabindex") || sentinel.hasAttribute("role") || sentinel.hasAttribute("contenteditable")
      || button.getAttribute("type") !== "button" || button.hasAttribute("role") || button.hasAttribute("popovertarget") || button.hasAttribute("commandfor")
      || !(button.textContent?.trim() || named(button)) || button.closest("label,summary")
      || button.querySelector("input,select,textarea,a,button,[tabindex],[contenteditable]")
      || find("[data-infinite-message]").length !== messages.size
      || [...messages].some(([name, node]) => one(`[data-infinite-message="${name}"]`) !== node
        || node.childElementCount || !node.textContent?.trim() || content.contains(node) || node.closest("button,label,summary"))) {
      throw new TypeError("Keep original native content, following empty sentinel, separate type=button and six authored plain-text messages.")
    }
    const root = next.scrollRoot
    if (root !== null) {
      if (!(root instanceof view!.HTMLElement) || !root.isConnected || root.getRootNode() !== document
        || !["div", "section", "article", "main", "aside"].includes(root.localName) || !root.contains(content) || !root.contains(sentinel)
        || root === content || root === sentinel || !named(root) || root.getAttribute("tabindex") !== "0"
        || root.hasAttribute("role") && root.getAttribute("role") !== "region") throw new TypeError("scrollRoot must be null (page) or a named native ancestor viewport with tabindex=0.")
      const style = view!.getComputedStyle(root)
      if (!["auto", "scroll"].includes(style.overflowY || style.overflow)
        || style.writingMode && style.writingMode !== "horizontal-tb") throw new TypeError("Element scroll roots require native vertical auto/scroll overflow and horizontal writing mode.")
    }
  }
  function config(input: InfiniteScrollSettings) {
    object(input, settingKeys)
    const next = { ...settings, ...input }
    for (const value of [next.disabled, next.hasMore, next.automatic]) if (typeof value !== "boolean") throw new TypeError("Infinite Scroll flags must be boolean.")
    if (!Number.isFinite(next.distance) || next.distance < 0 || next.distance > 4096) throw new RangeError("distance must be 0..4096 CSS pixels.")
    if (!Number.isSafeInteger(next.automaticLimit) || next.automaticLimit < 0 || next.automaticLimit > 20) throw new RangeError("automaticLimit must be an integer from 0 to 20.")
    validate(next)
    return next
  }
  function live() {
    if (!connected) throw new Error("Infinite Scroll is disconnected.")
    if (applying) throw new Error("Do not reenter Infinite Scroll settings/load while committing; disconnect is allowed.")
  }
  function pauseReason(): InfiniteScrollState["pauseReason"] {
    if (!settings.automatic) return "manual"
    if (!supported) return "unsupported"
    if (stalled) return "no-progress"
    if (automaticUsed >= settings.automaticLimit) return "limit"
    if (intersecting && entryUsed) return "entry"
    return null
  }
  function state(): InfiniteScrollState {
    const disabled = settings.disabled || blocked()
    const phase: InfiniteScrollPhase = !connected ? "disconnected" : flight ? flight.abort.signal.aborted || flight.generation !== generation || disabled ? "cancelling" : "loading"
      : settings.disabled ? "disabled" : !settings.hasMore ? "finished" : failure ? "error" : disabled ? "disabled" : pauseReason() ? "paused" : "idle"
    return Object.freeze({ phase, pending: flight !== null, disabled, hasMore: settings.hasMore, intersecting, automatic: settings.automatic,
      supported, automaticUsed, automaticLimit: settings.automaticLimit, lastAdded, generation, pauseReason: pauseReason() })
  }
  function current(job: Job) {
    return connected && flight === job && generation === job.generation && !job.abort.signal.aborted
      && element.ownerDocument === document && element.getRootNode() === document
      && !settings.disabled && settings.hasMore && !blocked() && content.isConnected && sentinel.isConnected
      && element.contains(content) && element.contains(sentinel) && own(content) && own(sentinel)
  }
  function render() {
    if (!connected || element.ownerDocument !== document || element.getRootNode() !== document || (element as Owned)[owner] !== token) return
    const value = state()
    writes.attr(element, "data-infinite-phase", value.phase)
    if (element.contains(content) && own(content)) writes.attr(content, "aria-busy", flight ? "true" : originalBusy)
    if (element.contains(button) && own(button)) {
      writes.attr(button, "hidden", null)
      writes.attr(button, "aria-disabled", value.pending || value.disabled || !value.hasMore ? "true" : originalAriaDisabled)
    }
    for (const [name, node] of messages) if (element.contains(node) && own(node)) writes.attr(node, "hidden", name === value.phase ? null : "")
    const signature = JSON.stringify(value)
    if (signature !== lastState) {
      lastState = signature
      element.dispatchEvent(new view!.CustomEvent("mui:infinite-state", { bubbles: true, detail: value }))
    }
  }
  function stopIntersection(clear = true) {
    observerVersion++; intersection?.disconnect(); intersection = undefined
    if (clear) { intersecting = false; entryUsed = false }
  }
  function abort(reason: string) {
    if (flight && !flight.abort.signal.aborted) flight.abort.abort(new view!.DOMException(reason, "AbortError"))
  }
  function invalidate(reason: string) { generation++; stopIntersection(); abort(reason) }
  function report(error: unknown) {
    if (!connected) return
    failure = { error }
    stopIntersection(false)
    render()
    if (connected) element.dispatchEvent(new view!.CustomEvent("mui:infinite-error", { bubbles: true, detail: { error, generation } }))
  }
  function autoEligible() {
    return connected && settings.automatic && supported && automaticUsed < settings.automaticLimit
      && !settings.disabled && settings.hasMore && !flight && !failure && !stalled && !blocked()
  }
  function triggered(reason: InfiniteScrollContext["reason"]) {
    const stamp = generation
    void request(reason).catch(error => { if (connected && generation === stamp) report(error) })
  }
  function observe(clear = true, suppressInitial = false) {
    stopIntersection(clear)
    if (!settings.automatic || !supported || settings.disabled || !settings.hasMore || failure || stalled || blocked()) return
    const version = observerVersion
    let first = true
    intersection = new view!.IntersectionObserver(entries => {
      if (!connected || version !== observerVersion) return
      const entry = entries.filter(entry => entry.target === sentinel).at(-1)
      if (!entry) return
      const visible = entry.isIntersecting && (!entry.rootBounds || entry.rootBounds.height > 0 && entry.rootBounds.width > 0)
      const entering = visible && !intersecting
      intersecting = visible
      if (!visible) entryUsed = false
      if (entering) {
        entryUsed = true
        if (!(first && suppressInitial) && autoEligible()) triggered("automatic")
      }
      first = false
      render()
    }, { root: settings.scrollRoot, rootMargin: `0px 0px ${settings.distance}px 0px`, threshold: 0 })
    intersection.observe(sentinel)
  }
  function settle(job: Job, outcome: InfiniteScrollOutcome) {
    if (flight === job) {
      flight = null
      if (connected) render()
    }
    job.resolve(Object.freeze(outcome))
  }
  function aborted(job: Job, cause?: unknown): InfiniteScrollOutcome {
    if (!job.abort.signal.aborted) job.abort.abort(new view!.DOMException("Load authority is no longer current.", "AbortError"))
    return { status: "aborted", reason: job.abort.signal.reason, ...(cause === undefined ? {} : { cause }) }
  }
  async function execute(job: Job) {
    try {
      if (!current(job)) { settle(job, aborted(job)); return }
      const context: InfiniteScrollContext = Object.freeze({ signal: job.abort.signal, generation: job.generation, reason: job.reason, isCurrent: () => current(job) })
      const result = await loader(context)
      if (!current(job)) { settle(job, aborted(job)); return }
      object(result, ["added", "hasMore", "commit"])
      const { added, hasMore, commit } = result
      if (!Number.isSafeInteger(added) || added < 0 || typeof hasMore !== "boolean"
        || commit !== undefined && typeof commit !== "function" || added > 0 && !commit) throw new TypeError("Load results need nonnegative integer added, boolean hasMore, and a synchronous commit for positive progress.")
      validate(settings)
      if (!current(job)) { settle(job, aborted(job)); return }
      if (commit) {
        applying = true
        let value: unknown
        try { value = commit() } finally { applying = false }
        if (value !== undefined) {
          if (value && typeof (value as { then?: unknown }).then === "function") {
            // The unsupported async commit is already reported as a protocol error below.
            void Promise.resolve(value).catch(() => {})
          }
          throw new TypeError("commit must be synchronous and return undefined; async side effects cannot be rolled back.")
        }
      }
      if (!current(job)) { settle(job, aborted(job)); return }
      validate(settings)
      settings = { ...settings, hasMore }
      lastAdded = added; stalled = added === 0 && hasMore
      if (!hasMore || stalled) stopIntersection(false)
      else if (!intersection) observe(false, true)
      settle(job, { status: "loaded", added, hasMore })
    } catch (error) {
      applying = false
      if (!current(job)) { settle(job, aborted(job, error)); return }
      failure = { error }
      stopIntersection(false)
      settle(job, { status: "error", error })
      if (connected && generation === job.generation && failure?.error === error) element.dispatchEvent(new view!.CustomEvent("mui:infinite-error", { bubbles: true, detail: { error, generation: job.generation } }))
    }
  }
  function request(reason: InfiniteScrollContext["reason"]): Promise<InfiniteScrollOutcome> {
    try {
      live(); validate(settings)
      if (flight) {
        if (current(flight)) return flight.promise
        throw new Error("Previous cancelled load must settle before another can start.")
      }
      if (settings.disabled || blocked()) throw new Error("Infinite Scroll is disabled, hidden or inert.")
      if (!settings.hasMore) throw new Error("Infinite Scroll has finished; explicitly reset or set hasMore before loading.")
      if (reason === "automatic" && !autoEligible()) throw new Error("Automatic loading is paused.")
      const abort = new view!.AbortController()
      let resolve!: Job["resolve"]
      const promise = new Promise<InfiniteScrollOutcome>(done => { resolve = done })
      const job: Job = { abort, generation, reason, promise, resolve }
      flight = job; failure = null; stalled = false
      if (reason === "automatic") automaticUsed++
      render()
      queueMicrotask(() => { void execute(job) })
      return promise
    } catch (error) { return Promise.reject(error) }
  }
  function click(event: MouseEvent) {
    if (event.target !== button && !(event.target instanceof view!.Node && button.contains(event.target))) return
    if (flight || settings.disabled || !settings.hasMore || blocked()) { event.preventDefault(); return }
    queueMicrotask(() => {
      if (!connected || event.defaultPrevented || flight || settings.disabled || !settings.hasMore || blocked()) return
      triggered("manual")
    })
  }
  function watchNative() {
    nativeObserver?.disconnect()
    const watched = new Set<HTMLElement>()
    for (const start of [element, content, sentinel, button, settings.scrollRoot]) {
      for (let node = start; node; node = node.parentElement) watched.add(node)
    }
    for (const node of watched) nativeObserver!.observe(node, {
      attributes: true, childList: true,
      attributeFilter: node === button ? ["disabled", "inert", "class", "style"] : ["disabled", "hidden", "inert", "class", "style", "open"],
    })
  }
  function nativeChange() {
    if (!connected) return
    if (!element.isConnected || element.ownerDocument !== document || element.getRootNode() !== document) { disconnect(); return }
    try {
      validate(settings)
      const disabled = blocked()
      if (disabled !== nativeDisabled) {
        nativeDisabled = disabled
        invalidate("Native visibility or disabling changed.")
        if (!disabled) observe()
      }
      render()
    } catch (error) { invalidate("Native anatomy changed."); report(error) }
  }
  function disconnect() {
    if (!connected) return
    connected = false; invalidate("Infinite Scroll disconnected."); nativeObserver?.disconnect()
    button.removeEventListener("click", click)
    writes.restore()
    for (const node of nodes) if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
  }
  const { load: ignored, ...initial } = options
  try {
    settings = config(initial)
    for (const node of nodes) (node as Owned)[owner] = token
    nativeDisabled = blocked()
    render()
    button.addEventListener("click", click)
    nativeObserver = new view.MutationObserver(nativeChange)
    watchNative(); observe()
  } catch (error) { disconnect(); throw error }
  return {
    element, content, sentinel,
    get scrollRoot() { return settings.scrollRoot }, get connected() { return connected },
    get error() { return failure ? failure.error : null }, get state() { return state() },
    load: () => request("manual"),
    set(input) {
      live()
      const next = config(input)
      if (settingKeys.every(key => settings[key as keyof InfiniteScrollSettings] === next[key as keyof InfiniteScrollSettings])) { nativeChange(); return }
      settings = next
      invalidate("Infinite Scroll settings changed."); nativeDisabled = blocked()
      watchNative(); observe(); render()
    },
    reset(input = {}) {
      live(); object(input, ["hasMore"])
      const next = config({ hasMore: "hasMore" in input ? input.hasMore : true })
      settings = next
      invalidate("Infinite Scroll reset."); automaticUsed = 0; lastAdded = 0; failure = null; stalled = false
      nativeDisabled = blocked(); watchNative(); observe(); render()
    },
    refresh() { live(); validate(settings); watchNative(); nativeChange(); if (!intersection && !failure && !stalled) observe(false) },
    disconnect,
  }
}
