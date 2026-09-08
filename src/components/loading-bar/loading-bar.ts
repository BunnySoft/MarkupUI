export type LoadingBarState = "idle" | "loading" | "success" | "error"
export interface LoadingBarOptions {
  finishDelay?: number | null
  errorDelay?: number | null
  labels?: Record<LoadingBarState, string>
}
export interface LoadingBarController {
  readonly connected: boolean
  readonly state: LoadingBarState
  readonly outcome: "success" | "error" | null
  readonly value: number | null
  start(): void
  setProgress(value: number): void
  finish(): void
  error(): void
  stop(): void
  connect(): void
  disconnect(): void
}
interface Attribute { node: Element; name: string; before: string | null; last: string | null }
const owners = new WeakMap<HTMLElement, LoadingBarController>()
const phases: LoadingBarState[] = ["idle", "loading", "success", "error"]

export function createLoadingBar(root: HTMLElement, options: LoadingBarOptions = {}): LoadingBarController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches(".mui-loading-bar[data-loading-bar]")) throw new TypeError("Loading Bar needs an authored .mui-loading-bar[data-loading-bar] root.")
  if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Loading Bar options must be an object.")
  for (const key of Object.keys(options)) if (!["finishDelay", "errorDelay", "labels"].includes(key)) throw new TypeError(`Unsupported Loading Bar option: ${key}.`)
  const finishDelay = options.finishDelay === undefined ? 600 : options.finishDelay
  const errorDelay = options.errorDelay === undefined ? null : options.errorDelay
  for (const delay of [finishDelay, errorDelay]) if (delay !== null && (!Number.isSafeInteger(delay) || delay < 0 || delay > 60_000)) throw new RangeError("Terminal delays must be null or integer milliseconds from 0 to 60000.")
  if (options.labels !== undefined && (!options.labels || typeof options.labels !== "object" || Array.isArray(options.labels))) throw new TypeError("Loading Bar labels must be a text record.")
  const labels = { ...(options.labels ?? { idle: "Not loading", loading: "Loading", success: "Completed", error: "Failed" }) }
  if (Object.keys(labels).length !== 4 || !phases.every(phase => typeof labels[phase] === "string" && labels[phase].trim())) throw new TypeError("Provide all four nonempty Loading Bar text labels.")
  let progress: HTMLProgressElement, status: HTMLElement, text: Text
  let beforeText = "", lastText = ""
  let state: LoadingBarState = "idle", connected = false, timer = 0, generation = 0
  let outcome: "success" | "error" | null = null
  const attributes: Attribute[] = []
  function capture(records: MutationRecord[]) {
    for (const record of records) {
      if (record.type === "attributes") {
        const entry = attributes.find(entry => entry.node === record.target && entry.name === record.attributeName)
        if (entry) entry.before = entry.node.getAttribute(entry.name)
      } else if (record.type === "characterData" && record.target === text) beforeText = text.data
    }
  }
  const observer = new view.MutationObserver(records => {
    capture(records)
    if (!connected) return
    if (!root.isConnected) { controller.disconnect(); return }
    try { validate(); observer.disconnect(); observe() } catch (error) { fault(error) }
  })
  function pause() { capture(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { attributes: true, childList: true, characterData: true, subtree: true })
    // Ancestor child-list records detect removal/reparenting without observing the whole document subtree.
    for (let ancestor = root.parentNode; ancestor; ancestor = ancestor.parentNode) observer.observe(ancestor, { childList: true })
  }
  function attr(node: Element, name: string, value: string | null) {
    let entry = attributes.find(entry => entry.node === node && entry.name === name)
    if (!entry) { entry = { node, name, before: node.getAttribute(name), last: value }; attributes.push(entry) }
    entry.last = value
    if (value === null) node.removeAttribute(name)
    else node.setAttribute(name, value)
  }
  function maximum() {
    const raw = progress.getAttribute("max")
    const max = raw === null ? 1 : Number(raw)
    if (!Number.isFinite(max) || max <= 0 || progress.max !== max) throw new RangeError("Author a valid positive finite native progress maximum.")
    return max
  }
  function validate() {
    if (root.getRootNode() !== document || !root.matches(".mui-loading-bar[data-loading-bar]")
      || root.querySelector("[data-loading-bar]")) throw new TypeError("Use a connected light-DOM Loading Bar root, not nested status surfaces.")
    if (root.querySelectorAll("progress").length !== 1 || !root.contains(progress)
      || root.querySelectorAll("[data-loading-bar-status]").length !== 1 || root.querySelector("[data-loading-bar-status]") !== status
      || !root.contains(status) || progress.contains(status)
      || status.childNodes.length !== 1 || status.firstChild !== text) throw new TypeError("Loading Bar anatomy changed; disconnect and reconnect to adopt replacements.")
    const interactive = "a[href], button, input, select, textarea, summary, iframe, audio[controls], video[controls], [tabindex], [contenteditable]"
    const nodes = [root, ...root.querySelectorAll<HTMLElement>("*")]
    if (nodes.some(node => node.matches(interactive) || node.hasAttribute("autofocus")
      || node.hasAttribute("role") && (node === progress ? node.getAttribute("role") !== "progressbar" : !["status", "group", "note", "none", "presentation"].includes(node.getAttribute("role")!)))) {
      throw new TypeError("Loading Bar owns a passive surface; native progress is its only progressbar owner.")
    }
    if (["aria-valuenow", "aria-valuemin", "aria-valuemax"].some(name => progress.hasAttribute(name))) throw new TypeError("Native progress value/max own its numeric accessibility state.")
    const ids = progress.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean)
    const named = ids?.length ? ids.every(id => document!.getElementById(id)?.textContent?.trim())
      : progress.getAttribute("aria-label")?.trim() || [...progress.labels].some(label => label.textContent?.trim())
    if (!named || progress.id && [...document!.querySelectorAll("[id]")].filter(node => node.id === progress.id).length !== 1) throw new TypeError("Name the native progress using an explicit label and unique authored IDs.")
    if (status.hidden || status.getAttribute("aria-hidden") === "true" || !text.data.trim()) throw new TypeError("Keep readable authored status text.")
    const max = maximum(), raw = progress.getAttribute("value")
    if (raw !== null && (!Number.isFinite(Number(raw)) || !raw.trim() || Number(raw) < 0 || Number(raw) > max || progress.value !== Number(raw))) throw new RangeError("Native progress value must be finite from zero to max, or absent for unknown work.")
  }
  function clear() { generation++; view!.clearTimeout(timer); timer = 0 }
  function ready() {
    if (!connected) throw new Error("Connect Loading Bar before using operation methods.")
    try { validate() } catch (error) { controller.disconnect(); throw error }
  }
  function fault(error: unknown) {
    controller.disconnect()
    root.dispatchEvent(new view!.CustomEvent("mui:loading-bar-fault", { detail: { error } }))
  }
  function paint(next: LoadingBarState, value: number | null, notify = true) {
    const previous = state
    clear(); pause()
    state = next
    attr(root, "data-loading-bar-state", next)
    attr(progress, "value", value === null ? null : String(value))
    attr(progress, "aria-valuetext", next === "loading" && value !== null ? null : labels[next])
    text.data = labels[next]; lastText = text.data
    observe()
    const delay = next === "success" ? finishDelay : next === "error" ? errorDelay : null
    if (delay !== null) {
      const version = generation
      timer = view!.setTimeout(() => {
        if (!connected || generation !== version) return
        timer = 0
        try { ready(); paint("idle", null) } catch (error) { fault(error) }
      }, delay)
    }
    if (notify && previous !== next) root.dispatchEvent(new view!.CustomEvent("mui:loading-bar-change", { detail: { state: next, previous } }))
  }
  function terminal(next: "success" | "error") {
    ready()
    if (outcome !== null) return
    outcome = next
    paint(next, next === "success" ? maximum() : progress.hasAttribute("value") ? progress.value : null)
  }
  const controller: LoadingBarController = {
    get connected() { return connected },
    get state() { return state },
    get outcome() { return outcome },
    get value() { return progress?.hasAttribute("value") ? progress.value : null },
    start() { ready(); outcome = null; paint("loading", null) },
    setProgress(value) {
      ready()
      if (state !== "loading") throw new Error("setProgress requires a started Loading Bar.")
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > maximum()) throw new RangeError("Measured progress must be finite from zero to the authored max.")
      paint("loading", value)
    },
    finish() { terminal("success") },
    error() { terminal("error") },
    stop() { ready(); outcome = null; paint("idle", null) },
    connect() {
      if (connected) return
      if (owners.has(root)) throw new Error("Loading Bar root already has an active controller.")
      const native = root.querySelector("progress")
      const label = root.querySelector<HTMLElement>("[data-loading-bar-status]")
      if (!(native instanceof view!.HTMLProgressElement) || !label || label.childNodes.length !== 1 || label.firstChild?.nodeType !== 3) throw new TypeError("Author one native progress and one text-only data-loading-bar-status.")
      progress = native; status = label; text = label.firstChild as Text
      validate()
      beforeText = text.data; lastText = text.data
      outcome = null
      owners.set(root, controller); connected = true
      try { paint("idle", null, false) } catch (error) { controller.disconnect(); throw error }
    },
    disconnect() {
      if (!connected) return
      clear(); pause(); connected = false
      for (const entry of attributes.splice(0).reverse()) {
        if (entry.node.getAttribute(entry.name) !== entry.last) continue
        if (entry.before === null) entry.node.removeAttribute(entry.name)
        else entry.node.setAttribute(entry.name, entry.before)
      }
      if (text?.parentNode === status && text.data === lastText) text.data = beforeText
      state = "idle"
      outcome = null
      if (owners.get(root) === controller) owners.delete(root)
    },
  }
  controller.connect()
  return controller
}
