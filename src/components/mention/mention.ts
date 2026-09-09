export type MentionControl = HTMLInputElement | HTMLTextAreaElement
export interface MentionContext { readonly prefix: string; readonly query: string; readonly start: number; readonly end: number }
export interface MentionOption { value: string; label?: string; disabled?: boolean; class?: string }
export interface MentionSearch extends MentionContext { readonly control: MentionControl; readonly signal: AbortSignal }
export type MentionLoader = (context: MentionSearch) => readonly MentionOption[] | Promise<readonly MentionOption[]>
export interface MentionOptions {
  panel: HTMLElement
  options?: readonly MentionOption[]
  load?: MentionLoader
  filter?: (query: string, option: Readonly<MentionOption>, prefix: string) => boolean
  prefix?: string | readonly string[]
  separator?: string
  maxResults?: number
  minQueryLength?: number
  maxQueryLength?: number
  debounce?: number
}
export interface MentionQueryResult {
  readonly status: "updated" | "skipped" | "aborted"
  readonly context: MentionContext | null
  readonly count: number
  readonly current: boolean
}
export interface MentionController {
  readonly control: MentionControl
  readonly panel: HTMLElement
  readonly connected: boolean
  readonly context: MentionContext | null
  readonly error: unknown
  query(): Promise<MentionQueryResult>
  select(value: string): boolean
  setOptions(options: readonly MentionOption[]): void
  refresh(): void
  close(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.mention.owner")
type Owned = Element & { [owner]?: MentionController }
interface Snapshot { text: string; start: number | null; end: number | null; form: HTMLFormElement | null; max: number; available: boolean }
interface Rendered { nodes: ChildNode[]; html: string }

/** A native editor plus adjacent action list; there is no caret mirror, popup geometry or rich-text model. */
export function createMention(control: MentionControl, settings: MentionOptions): MentionController {
  const document = control?.ownerDocument, view = document?.defaultView
  if (!view || !(control instanceof view.HTMLInputElement || control instanceof view.HTMLTextAreaElement)) throw new TypeError("Mention needs a native text input or textarea.")
  if (!settings || typeof settings !== "object" || Array.isArray(settings)
    || Object.keys(settings).some(key => !["panel", "options", "load", "filter", "prefix", "separator", "maxResults", "minQueryLength", "maxQueryLength", "debounce"].includes(key))
    || !(settings.panel instanceof view.HTMLElement)
    || settings.load !== undefined && typeof settings.load !== "function"
    || settings.filter !== undefined && typeof settings.filter !== "function"
    || settings.load !== undefined && settings.options !== undefined) throw new TypeError("Use an authored panel and either static options or one loader, with an optional filter.")
  const panel = settings.panel, load = settings.load, filter = settings.filter
  const prefixes = typeof settings.prefix === "string" ? [settings.prefix] : settings.prefix === undefined ? ["@"] : settings.prefix
  const separator = settings.separator ?? " ", maxResults = settings.maxResults ?? 20
  const minQueryLength = settings.minQueryLength ?? 1, maxQueryLength = settings.maxQueryLength ?? 64, debounce = settings.debounce ?? 120
  const unit = (value: unknown): value is string => typeof value === "string" && value.length === 1 && !/[\r\n\uD800-\uDFFF]/.test(value)
  if (!Array.isArray(prefixes) || prefixes.length < 1 || prefixes.length > 8 || new Set(prefixes).size !== prefixes.length
    || Array.from(prefixes).some(prefix => !unit(prefix) || /\s/.test(prefix)) || !unit(separator) || prefixes.includes(separator)
    || settings.separator !== undefined && typeof settings.separator !== "string"
    || settings.maxResults !== undefined && typeof settings.maxResults !== "number"
    || settings.minQueryLength !== undefined && typeof settings.minQueryLength !== "number"
    || settings.maxQueryLength !== undefined && typeof settings.maxQueryLength !== "number"
    || settings.debounce !== undefined && typeof settings.debounce !== "number"
    || !Number.isInteger(maxResults) || maxResults < 1 || maxResults > 100
    || !Number.isInteger(minQueryLength) || minQueryLength < 0 || !Number.isInteger(maxQueryLength) || maxQueryLength < 1 || maxQueryLength > 256 || minQueryLength > maxQueryLength
    || !Number.isInteger(debounce) || debounce < 0 || debounce > 1000) throw new TypeError("Use 1-8 unique one-BMP-unit prefixes, a distinct one-unit separator, maxResults 1-100, query lengths 0-256 and debounce 0-1000ms.")
  const prefixSet = new Set<string>(prefixes)
  const lists = panel.querySelectorAll<HTMLElement>("[data-mention-options]"), statuses = panel.querySelectorAll<HTMLElement>("[data-mention-status]")
  if (lists.length !== 1 || statuses.length > 1) throw new TypeError("Author one options list and at most one status inside the panel.")
  const list = lists[0]!, status = statuses[0] ?? null
  if (!panel.hidden || list.children.length || list.textContent?.trim()) throw new TypeError("The no-JS panel must start hidden, with an empty owned options container.")
  const original = [...list.childNodes], nodes = [control, panel, list, ...(status ? [status] : [])]
  for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Mention node already has an owner.")
  function wellFormed(value: string) {
    for (let index = 0; index < value.length; index++) {
      const code = value.charCodeAt(index)
      if (code >= 0xD800 && code <= 0xDBFF) {
        const next = value.charCodeAt(++index)
        if (!(next >= 0xDC00 && next <= 0xDFFF)) return false
      } else if (code >= 0xDC00 && code <= 0xDFFF) return false
    }
    return true
  }
  function normalize(values: readonly MentionOption[]) {
    if (!Array.isArray(values) || values.length > maxResults) throw new TypeError(`Supply at most ${maxResults} mention options; oversized results are not truncated.`)
    const seen = new Set<string>()
    return Object.freeze(Array.from(values, option => {
      if (!option || typeof option !== "object" || Array.isArray(option) || Object.keys(option).some(key => !["value", "label", "disabled", "class"].includes(key))) throw new TypeError("Mention options must be bounded plain option records.")
      const { value, label, disabled, class: className } = option
      if (typeof value !== "string" || !value.trim() || value.length > 256 || !wellFormed(value)
        || /[\r\n]/.test(value) || value.includes(separator) || [...prefixSet].some(prefix => value.includes(prefix))
        || seen.has(value) || label !== undefined && (typeof label !== "string" || !label.trim() || label.length > 1024 || !wellFormed(label))
        || disabled !== undefined && typeof disabled !== "boolean"
        || className !== undefined && (typeof className !== "string" || className.length > 256)) {
        throw new TypeError("Options need unique single-token string values (1-256 units), plain labels, boolean disabled and optional class; no render/style/object values.")
      }
      seen.add(value)
      return Object.freeze({ value, ...(label !== undefined ? { label } : {}), ...(disabled !== undefined ? { disabled } : {}), ...(className !== undefined ? { class: className } : {}) })
    }))
  }
  let staticOptions = normalize(settings.options === undefined ? [] : settings.options)
  let connected = true, generation = 0, composing = false, composition = 0, inserting = false, error: unknown = null
  let pending: AbortController | null = null, timer: number | null = null, rendered: Rendered | null = null
  let published: { snapshot: Snapshot; context: MentionContext; options: readonly Readonly<MentionOption>[]; version: number } | null = null
  let activeSnapshot: Snapshot | null = null
  let caret = { start: control.selectionStart, end: control.selectionEnd }
  let reset: { event: Event; composition: number } | null = null
  let hiddenBefore = panel.getAttribute("hidden"), hiddenLast = hiddenBefore
  let text: { before: string; last: string } | null = null
  const choices = new Map<HTMLButtonElement, Readonly<MentionOption>>(), tasks = new Set<number>(), removers: (() => void)[] = []
  function anatomy() {
    const named = panel.getAttribute("aria-label")?.trim() || panel.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => !!document!.getElementById(id)?.textContent?.trim())
    return control.isConnected && control.getRootNode() === document && panel.isConnected && panel.getRootNode() === document
      && (control instanceof view!.HTMLTextAreaElement || ["text", "search"].includes(control.type))
      && !["role", "aria-expanded", "aria-activedescendant"].some(name => control.hasAttribute(name))
      && control.getAttribute("aria-hidden") !== "true" && panel.getAttribute("aria-hidden") !== "true"
      && !panel.contains(control) && panel !== control && !!named
      && !panel.closest("label, button, a[href], summary") && !panel.matches("input, select, textarea")
      && (!panel.hasAttribute("role") || panel.getAttribute("role") === "region") && !panel.hasAttribute("aria-live")
      && panel.contains(list) && ["ul", "ol", "div"].includes(list.localName) && !list.hasAttribute("role") && !list.hasAttribute("tabindex")
      && [...panel.querySelectorAll<HTMLElement>("input, textarea, select, button, a[href], [tabindex], [contenteditable]")].every(node => choices.has(node as HTMLButtonElement))
      && (!status || panel.contains(status) && !list.contains(status) && ["span", "p", "div"].includes(status.localName) && !status.children.length
        && !status.hasAttribute("role") && !status.hasAttribute("aria-live") && !status.closest("label, button, a[href], summary")
        && !status.closest('[aria-live]:not([aria-live="off" i]), [role~="alert" i], [role~="status" i], [role~="log" i]'))
  }
  if (!anatomy()) throw new TypeError("Use a connected native editor and separate named noninteractive panel with native options list and nonlive status.")
  function available(node: HTMLElement, editing = false) {
    if (!node.isConnected || node.matches(":disabled") || node.closest("[hidden], [inert]") || editing && control.readOnly) return false
    for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
      const style = view!.getComputedStyle(parent)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function snapshot(): Snapshot {
    return { text: control.value, start: control.selectionStart, end: control.selectionEnd, form: control.form, max: control.maxLength, available: available(control, true) }
  }
  function same(a: Snapshot, b: Snapshot) {
    return a.text === b.text && a.start === b.start && a.end === b.end && a.form === b.form && a.max === b.max && a.available === b.available
  }
  function context(snapshot: Snapshot): MentionContext | null {
    if (composing || reset && reset.event.eventPhase !== 0 || !snapshot.available || snapshot.start === null || snapshot.end !== snapshot.start) return null
    const { text, end } = snapshot
    if (end > 0 && end < text.length && /[\uD800-\uDBFF]/.test(text[end - 1]!) && /[\uDC00-\uDFFF]/.test(text[end]!)) return null
    for (let index = end - 1; index >= 0 && end - index - 1 <= maxQueryLength; index--) {
      const char = text[index]!
      if (char === separator || char === "\n" || char === "\r") return null
      if (prefixSet.has(char)) {
        const query = text.slice(index + 1, end)
        return query.length >= minQueryLength && wellFormed(query) ? Object.freeze({ prefix: char, query, start: index, end }) : null
      }
    }
    return null
  }
  function listState(): Rendered { return { nodes: [...list.childNodes], html: list.innerHTML } }
  function ownedList() {
    if (!rendered) return list.childNodes.length === original.length && original.every((node, index) => list.childNodes[index] === node)
    const current = listState()
    return current.html === rendered.html && current.nodes.length === rendered.nodes.length && current.nodes.every((node, index) => node === rendered!.nodes[index])
  }
  function message(value: string) {
    if (!status) return
    const current = status.textContent ?? ""
    if (!text) text = { before: current, last: current }
    if (current !== text.last) text.before = current
    status.textContent = value; text.last = value
  }
  function visibility(shown: boolean) {
    const changed = panel.hidden === shown
    if (shown) panel.removeAttribute("hidden")
    else panel.setAttribute("hidden", "")
    hiddenLast = panel.getAttribute("hidden")
    return changed
  }
  function inScope() { return document!.activeElement === control || !!document!.activeElement && panel.contains(document!.activeElement) }
  function invalidate(recover: boolean, notify = true) {
    const version = ++generation, previous = pending, focused = document!.activeElement
    const focusedPanel = !!focused && panel.contains(focused)
    pending = null; published = null; activeSnapshot = null
    caret = { start: control.selectionStart, end: control.selectionEnd }
    if (timer !== null) view!.clearTimeout(timer)
    timer = null
    const wasShown = !panel.hidden
    if (ownedList()) list.replaceChildren(...original)
    choices.clear(); rendered = null
    if (panel.getAttribute("hidden") === hiddenLast) visibility(false)
    if (text && status?.textContent === text.last) status.textContent = text.before
    text = null
    if (recover && focused instanceof view!.HTMLElement && focusedPanel && available(control)
      && (document!.activeElement === focused || document!.activeElement === document!.body)) control.focus({ preventScroll: true })
    previous?.abort()
    if (notify && connected && generation === version && wasShown && panel.hidden) control.dispatchEvent(new view!.CustomEvent("mui:mention-visibility", { detail: { shown: false } }))
    return version
  }
  function settleReset() {
    const previous = reset
    if (!previous || previous.event.eventPhase !== 0) return
    reset = null
    if (previous.event.defaultPrevented) return
    if (composition === previous.composition) composing = false
    // Rebasing idle caret state is not cancellation of newer work.
    caret = { start: control.selectionStart, end: control.selectionEnd }
  }
  function report(reason: unknown, ctx: MentionContext | null) {
    error = reason
    control.dispatchEvent(new view!.CustomEvent("mui:mention-error", { detail: { error: reason, context: ctx } }))
  }
  function sync() {
    if (!connected) return
    settleReset()
    if (!anatomy() || !ownedList() || panel.getAttribute("hidden") !== hiddenLast) { disconnect(); return }
    if (activeSnapshot && !same(activeSnapshot, snapshot())) invalidate(true)
  }
  async function query(): Promise<MentionQueryResult> {
    sync()
    if (!connected) throw new Error("Mention is disconnected.")
    if (reset && reset.event.eventPhase !== 0) return Object.freeze({ status: "skipped", context: null, count: 0, current: false })
    const expected = generation + 1
    invalidate(true)
    const before = snapshot(), ctx = context(before), version = generation
    function current() { return connected && generation === version && anatomy() && ownedList()
      && panel.getAttribute("hidden") === hiddenLast && same(before, snapshot()) && inScope() }
    function result(status: MentionQueryResult["status"], count = 0): MentionQueryResult {
      return Object.freeze({ status, context: ctx, count, get current() { return status !== "aborted" && current() } })
    }
    if (!connected || generation !== expected) return result("aborted")
    if (!ctx || document!.activeElement !== control) return result("skipped")
    const controller = new view!.AbortController(), signal = controller.signal
    pending = controller; activeSnapshot = before; error = null
    message("Loading mention choices…")
    const show = visibility(true)
    if (show) control.dispatchEvent(new view!.CustomEvent("mui:mention-visibility", { detail: { shown: true } }))
    if (!current()) { if (connected && generation === version) invalidate(true); return result("aborted") }
    control.dispatchEvent(new view!.CustomEvent("mui:mention-search", { detail: ctx }))
    let remove = () => {}
    const cancelled = new Promise<null>(resolve => {
      const abort = () => resolve(null)
      signal.addEventListener("abort", abort, { once: true }); remove = () => signal.removeEventListener("abort", abort)
      if (signal.aborted) resolve(null)
    })
    const work = Promise.resolve().then(() => {
      if (signal.aborted || !current()) return null
      return load ? load(Object.freeze({ ...ctx, control, signal })) : staticOptions
    }).then(values => {
      if (values === null && (signal.aborted || !current())) return null
      const normalized = normalize(values as readonly MentionOption[])
      return Object.freeze(normalized.filter(option => {
        if (signal.aborted || !current()) return false
        const matched = filter ? filter(ctx.query, option, ctx.prefix) : load ? true : (option.label ?? option.value).startsWith(ctx.query)
        if (typeof matched !== "boolean") throw new TypeError("Mention filter must return a boolean.")
        return matched
      }))
    }).catch(reason => {
      if (signal.aborted && reason instanceof view!.DOMException && reason.name === "AbortError") return null
      report(reason, ctx); throw reason
    })
    try {
      const values = await Promise.race([work, cancelled])
      if (signal.aborted || !current() || values === null) {
        if (connected && generation === version) invalidate(true)
        return result("aborted")
      }
      const rows = values.map(option => {
        const row = document!.createElement(list.localName === "div" ? "div" : "li"), button = document!.createElement("button")
        button.type = "button"; button.textContent = option.label ?? option.value; button.disabled = option.disabled ?? false
        button.className = `mui-mention__choice${option.class ? ` ${option.class}` : ""}`
        choices.set(button, option); row.append(button); return row
      })
      list.replaceChildren(...rows); rendered = listState()
      published = { snapshot: before, context: ctx, options: values, version }; pending = null
      message(values.length ? `${values.length} mention choices. Tab to a button; Enter or Space inserts. Escape closes.` : "No mention choices. Ordinary editing remains available.")
      const completed = result("updated", values.length)
      control.dispatchEvent(new view!.CustomEvent("mui:mention-results", { detail: { context: ctx, options: values, result: completed } }))
      return completed
    } catch (reason) {
      if (current()) { pending = null; message("Mention search failed. Ordinary editing remains available.") }
      else if (connected && generation === version) invalidate(true)
      throw reason
    } finally { remove() }
  }
  function select(value: string) {
    sync()
    const session = published, candidate = session?.options.find(option => option.value === value)
    const button = [...choices].find(([, option]) => option === candidate)?.[0]
    if (!connected || !session || !candidate || candidate.disabled || !button || !available(button) || !inScope()
      || !same(session.snapshot, snapshot())) return false
    const { start, end, prefix } = session.context, from = start + prefix.length
    const separated = session.snapshot.text.slice(end).startsWith(separator)
    const insertion = candidate.value + (separated ? "" : separator)
    if (control.maxLength >= 0 && session.snapshot.text.length - (end - from) + insertion.length > control.maxLength) {
      message("That mention would exceed maxlength. Text was not changed.")
      control.dispatchEvent(new view!.CustomEvent("mui:mention-reject", { detail: { reason: "maxlength", option: candidate, prefix } }))
      return false
    }
    const active = document!.activeElement, expected = generation + 1
    inserting = true
    try {
      invalidate(false)
      if (!connected || generation !== expected || !same(session.snapshot, snapshot()) || !available(control, true)
        || document!.activeElement !== active && document!.activeElement !== document!.body) return false
      if (document!.activeElement !== control) control.focus({ preventScroll: true })
      if (!connected || generation !== expected || document!.activeElement !== control || !same(session.snapshot, snapshot())) return false
      control.setRangeText(insertion, from, end, "end")
      const caret = from + insertion.length + (separated ? separator.length : 0)
      control.setSelectionRange(caret, caret)
      control.dispatchEvent(new view!.InputEvent("input", { bubbles: true, composed: true, inputType: "insertReplacementText", data: insertion }))
    } finally { inserting = false }
    control.dispatchEvent(new view!.CustomEvent("mui:mention-select", { detail: { option: candidate, prefix } }))
    return true
  }
  function schedule() {
    if (inserting) return
    sync()
    if (!connected) return
    const expected = generation + 1
    invalidate(false)
    if (!connected || generation !== expected || document!.activeElement !== control || !context(snapshot())) return
    const before = snapshot(); activeSnapshot = before
    timer = view!.setTimeout(() => {
      timer = null
      if (!connected || generation !== expected || !same(before, snapshot()) || document!.activeElement !== control) return
      void query().catch(() => {}) // query reports unexpected failures to the original editor.
    }, debounce)
  }
  function caretChanged() {
    if (inserting || !connected) return
    settleReset()
    const current = snapshot()
    const changed = activeSnapshot ? !same(activeSnapshot, current) : caret.start !== current.start || caret.end !== current.end
    if (changed) { invalidate(true); if (document!.activeElement === control) schedule() }
  }
  function listen(node: EventTarget, type: string, listener: EventListener, capture = false) {
    node.addEventListener(type, listener, capture); removers.push(() => node.removeEventListener(type, listener, capture))
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => { tasks.delete(id); if (connected) callback() }, 0); tasks.add(id)
  }
  const observer = new view.MutationObserver(sync)
  function disconnect() {
    if (!connected) return
    const previous = pending; pending = null
    connected = false; observer.disconnect()
    removers.splice(0).forEach(remove => remove()); tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    invalidate(true, false)
    if (panel.getAttribute("hidden") === hiddenLast) {
      if (hiddenBefore === null) panel.removeAttribute("hidden")
      else panel.setAttribute("hidden", hiddenBefore)
    }
    for (const node of nodes) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
    reset = null
    previous?.abort()
  }
  const api: MentionController = {
    control, panel, get connected() { return connected }, get context() { return connected ? context(snapshot()) : null }, get error() { return error },
    query, select, setOptions(values) {
      if (load) throw new TypeError("Use the declared loader or recreate for static options.")
      const normalized = normalize(values)
      if (!connected) throw new Error("Mention is disconnected.")
      const version = generation + 1
      invalidate(true)
      if (!connected || generation !== version) throw new Error("Mention options update was superseded or disconnected.")
      staticOptions = normalized
    },
    refresh() { if (connected) { sync(); if (connected) invalidate(true) } },
    close() { if (connected) invalidate(true) }, disconnect,
  }
  for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
  listen(control, "input", event => {
    if ((event as InputEvent).isComposing) {
      if (!composing) composition++
      composing = true; invalidate(false)
    } else schedule()
  })
  listen(control, "change", caretChanged)
  listen(control, "click", schedule)
  listen(control, "keyup", event => { if ((event as KeyboardEvent).key !== "Escape") caretChanged() })
  listen(control, "select", caretChanged)
  listen(document!, "selectionchange", caretChanged)
  listen(control, "compositionstart", () => { composition++; composing = true; invalidate(false) })
  listen(control, "compositionend", () => { composition++; composing = false; schedule() })
  listen(document!, "focusin", event => { if (event.target !== control && !(event.target instanceof view!.Node && panel.contains(event.target))) invalidate(false) }, true)
  const focusOut = (event: Event) => {
    const destination = (event as FocusEvent).relatedTarget
    if (destination === control || destination instanceof view!.Node && panel.contains(destination)) return
    const version = generation
    later(() => { if (generation === version && !inScope()) invalidate(false) })
  }
  listen(control, "focusout", focusOut); listen(panel, "focusout", focusOut)
  listen(document!, "pointerdown", event => { if (event.target !== control && !(event.target instanceof view!.Node && panel.contains(event.target))) invalidate(false) }, true)
  const escape = (event: Event) => {
    const keyboard = event as KeyboardEvent
    if (keyboard.key === "Escape" && !keyboard.defaultPrevented && !keyboard.isComposing && !composing && (activeSnapshot || !panel.hidden)) {
      keyboard.preventDefault(); invalidate(true)
    }
  }
  listen(control, "keydown", escape); listen(panel, "keydown", escape)
  listen(list, "click", event => {
    const target = event.target instanceof view!.Element ? event.target.closest("button") : null
    const option = target ? choices.get(target) : undefined, version = generation
    if (!target || !option) return
    later(() => { if (!event.defaultPrevented && version === generation && choices.get(target) === option && available(target)) select(option.value) })
  })
  listen(document!, "reset", event => {
    if (event.target !== control.form) return
    settleReset()
    const previous = { event, composition }
    reset = previous
    invalidate(true)
    view!.queueMicrotask(() => { if (connected && reset === previous) settleReset() })
  }, true)
  listen(view, "blur", () => invalidate(false))
  observer.observe(document!, { childList: true, subtree: true, characterData: true, attributes: true,
    attributeFilter: ["type", "disabled", "readonly", "hidden", "inert", "form", "id", "maxlength", "role", "aria-label", "aria-labelledby",
      "aria-live", "aria-hidden", "aria-expanded", "aria-activedescendant", "class", "style", "tabindex", "contenteditable"] })
  return api
}
