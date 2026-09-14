import { ViewElement } from "../../core/index.js"

export const MAX_LOG_LINES = 10_000
export const MAX_LOG_CHARACTERS = 1_000_000
export const MAX_LOG_LINE_LENGTH = 16_384
export interface LogOptions {
  text?: string
  lines?: readonly string[]
  maxLines?: number
  maxCharacters?: number
  maxLineLength?: number
  follow?: boolean
  nearBottom?: number
  trim?: boolean
  loading?: boolean
}
export interface LogLine { readonly key: number; readonly text: string }
export interface LogUpdate {
  readonly droppedLines: number
  readonly anchorRemoved: boolean
  readonly pendingCR: boolean
}
export interface LogState extends LogUpdate {
  readonly lineCount: number
  readonly characters: number
  readonly totalDroppedLines: number
  readonly generation: number
  readonly follow: boolean
  readonly trim: boolean
  readonly loading: boolean
  readonly atTop: boolean
  readonly atBottom: boolean
}
export type LogScrollOptions =
  | { top: number; position?: never; silent?: boolean }
  | { position: "top" | "bottom"; top?: never; silent?: boolean }
export interface LogController {
  readonly viewport: HTMLPreElement
  readonly output: HTMLElement
  readonly connected: boolean
  readonly error: unknown
  readonly text: string
  readonly lines: readonly LogLine[]
  readonly state: LogState
  append(text: string): LogUpdate
  flush(): LogUpdate
  setText(text: string): LogUpdate
  setLines(lines: readonly string[]): LogUpdate
  trimStart(count: number): LogUpdate
  clear(): void
  setFollow(enabled: boolean): void
  setTrim(enabled: boolean): void
  setLoading(enabled: boolean): void
  scrollTo(options: LogScrollOptions): void
  refresh(): void
  disconnect(): void
}
interface Row extends LogLine { element: HTMLSpanElement; number: HTMLSpanElement; node: Text }
interface Metric { top: number; height: number; extent: number; width: number }
interface Anchor { row: Row; offset: number }
interface Attribute { node: HTMLElement; name: string; before: string | null; last: string | null }
const owner = Symbol.for("markup-ui.log.owner")
type Owned = Node & { [owner]?: object }

/** Bounded, fully mounted native text records. No parser, virtual window or transport. */
export function createLog(root: HTMLElement, options: LogOptions = {}): LogController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (view && root instanceof view.HTMLElement && root.localName === "m-log") {
    root.classList.add("m-log")
    root.dataset.log = ""
  }
  if (!view || !(root instanceof view.HTMLElement) || !root.matches(".m-log[data-log]")
    || !["div", "section", "m-log"].includes(root.localName) || (root as Owned)[owner]) throw new TypeError("Log needs an unowned native div/section.m-log[data-log].")
  function object(value: unknown, allowed: readonly string[]) {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new TypeError("Unsupported Log configuration.")
  }
  function integer(value: number, limit: number, name: string) {
    if (!Number.isSafeInteger(value) || value < 1 || value > limit) throw new RangeError(`${name} must be an integer from 1 to ${limit}.`)
    return value
  }
  function boolean(value: unknown): asserts value is boolean { if (typeof value !== "boolean") throw new TypeError("Log flags must be boolean.") }
  object(options, ["text", "lines", "maxLines", "maxCharacters", "maxLineLength", "follow", "nearBottom", "trim", "loading"])
  if ("text" in options && "lines" in options) throw new TypeError("Choose text or lines, not both.")
  const maxLines = integer(options.maxLines === undefined ? MAX_LOG_LINES : options.maxLines, MAX_LOG_LINES, "maxLines")
  const maxCharacters = integer(options.maxCharacters === undefined ? MAX_LOG_CHARACTERS : options.maxCharacters, MAX_LOG_CHARACTERS, "maxCharacters")
  const maxLineLength = integer(options.maxLineLength === undefined ? Math.min(MAX_LOG_LINE_LENGTH, maxCharacters) : options.maxLineLength, Math.min(MAX_LOG_LINE_LENGTH, maxCharacters), "maxLineLength")
  const nearBottom = options.nearBottom === undefined ? 4 : options.nearBottom
  if (!Number.isFinite(nearBottom) || nearBottom < 0 || nearBottom > 256) throw new RangeError("nearBottom must be 0..256 CSS pixels.")
  let follow = options.follow === undefined ? false : options.follow, trim = options.trim === undefined ? false : options.trim, loading = options.loading === undefined ? false : options.loading
  for (const flag of [follow, trim, loading]) boolean(flag)
  const own = (node: Element) => node.closest("[data-log]") === root
  function one(selector: string, required = false) {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const viewportNode = one("[data-log-viewport]", true), outputNode = one("[data-log-output]", true)
  if (!(viewportNode instanceof view.HTMLPreElement) || !outputNode || outputNode.localName !== "code") throw new TypeError("Log needs a native pre and code, not an editable/form/terminal control.")
  const viewport = viewportNode, output = outputNode, status = one("[data-log-loading]")
  const token = {}, attributes: Attribute[] = []
  let connected = true, busy = false, initialized = false, error: unknown = null, nextKey = 1, generation = 0, revision = 0
  let rows: Row[] = [], characters = 0, totalDroppedLines = 0, pendingCR = false
  let update: LogUpdate = Object.freeze({ droppedLines: 0, anchorRemoved: false, pendingCR: false })
  let last: Metric, anchor: Anchor | null = null, edgeTop = false, edgeBottom = false
  let silentTop: number | null = null, observer: ResizeObserver | undefined
  function live() { if (!connected) throw new Error("Log is disconnected; its current native text remains static.") }
  function named(node: HTMLElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => document!.getElementById(id)?.textContent?.trim()))
  }
  function anatomy() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".m-log[data-log]")
      || one("[data-log-viewport]", true) !== viewport || one("[data-log-output]", true) !== output || one("[data-log-loading]") !== status
      || viewport.parentElement !== root || output.parentElement !== viewport || viewport.childNodes.length !== 1
      || !viewport.classList.contains("m-code-block") || !output.classList.contains("m-code")
      || !named(viewport) || viewport.getAttribute("tabindex") !== "0" || viewport.getAttribute("role") !== "region"
      || [root, viewport, output].some(node => node.hasAttribute("contenteditable") || node.hasAttribute("is")
        || node.getAttribute("aria-live") !== null && node.getAttribute("aria-live") !== "off"
        || (node as Owned)[owner] && (node as Owned)[owner] !== token)
      || root.hasAttribute("role") && root.getAttribute("role") !== "region" || output.hasAttribute("role")
      || status && (!root.contains(status) || !own(status) || status.childElementCount || viewport.contains(status) || status.closest("label,button,summary"))
      || output.children.length !== rows.length && initialized) throw new TypeError("Keep the passive named pre/code anatomy; no live log/terminal role, editing or foreign child renderer.")
    if (initialized) {
      if (output.childNodes.length !== rows.length) throw new TypeError("Log text is exclusively owned; update through the controller.")
      rows.forEach((row, index) => {
        if (output.childNodes[index] !== row.element || row.element.childNodes.length !== 2
          || row.element.firstChild !== row.number || row.element.lastChild !== row.node
          || row.number.childNodes.length || row.number.getAttribute("aria-hidden") !== "true" || !row.number.classList.contains("m-code-number")
          || !row.element.classList.contains("m-code-line") || row.element.hasAttribute("hidden")
          || [row.element, row.number].some(node => node.hasAttribute("tabindex") || node.hasAttribute("contenteditable") || node.hasAttribute("role"))
          || (row.element as Owned)[owner] !== token
          || row.element.getAttribute("data-log-key") !== String(row.key)
          || row.node.data !== rendered(row, index, rows.length, trim)) throw new TypeError("An owned log line was changed externally; do not replace its text, markers or children.")
      })
    }
  }
  function run<T>(action: () => T): T {
    live()
    if (busy) throw new Error("Log operations cannot reenter an active update.")
    busy = true
    try { anatomy(); const result = action(); error = null; return result }
    catch (cause) { error = cause; throw cause }
    finally { busy = false }
  }
  function write(node: HTMLElement, name: string, value: string | null) {
    let record = attributes.find(record => record.node === node && record.name === name)
    if (!record) { record = { node, name, before: node.getAttribute(name), last: node.getAttribute(name) }; attributes.push(record) }
    if (node.getAttribute(name) !== record.last) record.before = node.getAttribute(name)
    if (value === null) node.removeAttribute(name); else node.setAttribute(name, value)
    record.last = value
  }
  function original(node: HTMLElement, name: string) {
    const record = attributes.find(record => record.node === node && record.name === name)
    return record && node.getAttribute(name) === record.last ? record.before : node.getAttribute(name)
  }
  function input(text: string) {
    if (typeof text !== "string" || text.length > MAX_LOG_CHARACTERS) throw new RangeError("Each Log input must be a string of at most 1000000 UTF-16 code units.")
    return text
  }
  function split(text: string) {
    const lines = text.split("\n", MAX_LOG_LINES + 1)
    if (lines.length > MAX_LOG_LINES) throw new RangeError("Each input may contain at most 10000 LF-delimited lines, including a trailing empty line.")
    return lines
  }
  function normalize(text: string) { return input(text).replace(/\r\n?/g, "\n") }
  function lineInput(lines: readonly string[]) {
    if (!Array.isArray(lines) || lines.length > MAX_LOG_LINES) throw new RangeError("lines must be an array of at most 10000 plain strings.")
    let size = Math.max(0, lines.length - 1)
    for (const line of lines) {
      if (typeof line !== "string" || /[\r\n]/.test(line)) throw new TypeError("Line array entries must be strings without CR/LF; use setText for text chunks.")
      size += line.length
      if (size > MAX_LOG_CHARACTERS) throw new RangeError("Line input exceeds 1000000 UTF-16 code units.")
    }
    return lines.length ? [...lines] : [""]
  }
  function fit(data: readonly LogLine[]) {
    let length = data.length - 1
    for (const line of data) {
      if (line.text.length > maxLineLength) throw new RangeError(`A log line exceeds maxLineLength (${maxLineLength}); no partial line was discarded.`)
      length += line.text.length
    }
    let dropped = 0
    while (data.length - dropped > maxLines || length > maxCharacters) length -= data[dropped++]!.text.length + 1
    return { data: data.slice(dropped), length, dropped }
  }
  function rendered(line: LogLine, index: number, length: number, trimmed: boolean) {
    return (trimmed ? line.text.trim() : line.text) + (index < length - 1 ? "\n" : "")
  }
  function ranges() {
    const selection = view!.getSelection()
    if (!selection || selection.isCollapsed) return []
    return Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index))
  }
  function selected(node: Node, selection = ranges()) { return selection.some(range => range.intersectsNode(node)) }
  function metric(): Metric { return { top: viewport.scrollTop, height: viewport.clientHeight, extent: viewport.scrollHeight, width: viewport.clientWidth } }
  function bottom(value: Metric) { return value.height > 0 && value.extent - value.height - value.top <= nearBottom }
  function top(value: Metric) { return value.height > 0 && value.top <= 1 }
  function capture(value: Metric) {
    if (!value.height) return null
    // Native block offsets stay ordered even when individual records soft-wrap.
    let low = 0, high = rows.length
    while (low < high) {
      const middle = Math.floor((low + high) / 2), element = rows[middle]!.element
      if (element.offsetTop + element.offsetHeight > value.top) high = middle
      else low = middle + 1
    }
    const row = rows[low]
    return row ? { row, offset: value.top - row.element.offsetTop } : null
  }
  function remember() { last = metric(); anchor = capture(last); edgeTop = top(last); edgeBottom = bottom(last) }
  function place(value: number, silent = true) {
    revision++
    const previous = viewport.scrollTop
    viewport.scrollTop = Math.max(0, Math.min(Math.max(0, viewport.scrollHeight - viewport.clientHeight), value))
    silentTop = silent && previous !== viewport.scrollTop ? viewport.scrollTop : null
    if (silent) remember()
  }
  function canFollow(before: Metric) { return follow && bottom(before) && ranges().length === 0 && !viewport.closest("[hidden],[inert]") }
  function allocate(data: readonly string[]) {
    if (!Number.isSafeInteger(nextKey + data.length)) throw new RangeError("Log line key capacity exhausted; create a new owner.")
    return data.map((text, index) => ({ key: nextKey + index, text }))
  }
  function commit(data: readonly LogLine[], keyAfter: number, pending: boolean, mode: "append" | "replace" | "trim", displayTrim = trim): LogUpdate {
    const fitted = fit(data), next = fitted.data, existing = new Map(rows.map(row => [row.key, row]))
    const wanted = new Map(next.map((line, index) => [line.key, rendered(line, index, next.length, displayTrim)]))
    const selection = ranges()
    for (const row of rows) if ((!wanted.has(row.key) || wanted.get(row.key) !== row.node.data) && selected(row.element, selection)) {
      throw new Error("Log update would change selected text. Release the native selection before replacing, trimming or appending to its selected tail.")
    }
    const before = metric(), oldAnchor = capture(before), shouldFollow = mode !== "replace" && canFollow(before)
    const staged: Row[] = next.map((line, index) => {
      const current = existing.get(line.key)
      if (current) return current.text === line.text ? current : { ...current, text: line.text }
      const element = document!.createElement("span"), number = document!.createElement("span")
      element.className = "m-code-line"; element.setAttribute("data-log-key", String(line.key))
      number.className = "m-code-number"; number.setAttribute("aria-hidden", "true")
      const node = document!.createTextNode(rendered(line, index, next.length, displayTrim))
      element.append(number, node)
      return { ...line, element, number, node }
    })
    const fragment = document!.createDocumentFragment()
    for (const row of rows) if (!wanted.has(row.key)) { row.element.remove(); delete (row.element as Owned)[owner] }
    for (const row of staged) {
      const text = wanted.get(row.key)!
      if (row.node.data !== text) {
        if (text.startsWith(row.node.data)) row.node.appendData(text.slice(row.node.length))
        else row.node.replaceData(0, row.node.length, text)
      }
      if (!existing.has(row.key)) { (row.element as Owned)[owner] = token; fragment.append(row.element) }
    }
    output.append(fragment)
    const removed = oldAnchor !== null && !wanted.has(oldAnchor.row.key)
    rows = staged; characters = fitted.length; nextKey = keyAfter; pendingCR = pending; trim = displayTrim
    totalDroppedLines += fitted.dropped
    if (mode === "replace") { generation++; silentTop = null; place(0) }
    else if (shouldFollow) place(viewport.scrollHeight)
    else if (oldAnchor && wanted.has(oldAnchor.row.key)) place(oldAnchor.row.element.offsetTop + oldAnchor.offset)
    else place(removed ? 0 : before.top)
    update = Object.freeze({ droppedLines: fitted.dropped, anchorRemoved: removed, pendingCR })
    return update
  }
  function replace(data: readonly string[]) {
    const fresh = allocate(data)
    return commit(fresh, nextKey + fresh.length, false, "replace")
  }
  function append(text: string, final = false) {
    const raw = (pendingCR ? "\r" : "") + input(text)
    const pending = !final && raw.endsWith("\r")
    const normalized = (pending ? raw.slice(0, -1) : raw).replace(/\r\n?/g, "\n"), parts = split(normalized)
    const tail = rows.at(-1)!, added = allocate(parts.slice(1))
    const next: LogLine[] = [...rows.slice(0, -1), { key: tail.key, text: tail.text + parts[0]! }, ...added]
    return commit(next, nextKey + added.length, pending, "append")
  }
  function refresh() {
    run(() => {
      const current = metric(), samePosition = Math.abs(current.top - Math.min(last.top, Math.max(0, current.extent - current.height))) <= 1
      if (samePosition && canFollow(last)) place(current.extent)
      else if (samePosition && anchor && rows.some(row => row.key === anchor!.row.key)) place(anchor.row.element.offsetTop + anchor.offset)
      remember()
    })
  }
  function attempt(action: () => void) {
    try { action() } catch (cause) {
      error = cause
      root.dispatchEvent(new view!.CustomEvent("m:log-error", { bubbles: true, detail: { error: cause } }))
    }
  }
  function scroll(event: Event) {
    if (!connected || event.target !== viewport) return
    attempt(() => {
      const value = metric(), silence = silentTop !== null && Math.abs(silentTop - value.top) <= 1
      silentTop = null
      const positions: ("top" | "bottom")[] = []
      if (!silence && top(value) && !edgeTop) positions.push("top")
      if (!silence && bottom(value) && !edgeBottom) positions.push("bottom")
      remember()
      const stamp = revision
      for (const position of positions) {
        if (!connected || revision !== stamp) break
        root.dispatchEvent(new view!.CustomEvent("m:log-edge", { bubbles: true, detail: { position, event } }))
      }
    })
  }
  function setLoading(value: boolean) {
    boolean(value)
    write(viewport, "aria-busy", value ? "true" : original(viewport, "aria-busy"))
    if (status) write(status, "hidden", value ? null : "")
    loading = value
  }
  function disconnect() {
    if (!connected) return
    connected = false; generation++; revision++; silentTop = null; observer?.disconnect()
    delete (root as OwnedController)[controllerRef]
    viewport.removeEventListener("scroll", scroll)
    for (const record of attributes) if (record.node.getAttribute(record.name) === record.last) {
      if (record.before === null) record.node.removeAttribute(record.name); else record.node.setAttribute(record.name, record.before)
    }
    attributes.length = 0
    for (const node of [root, viewport, output, ...rows.map(row => row.element)]) if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
  }
  try {
    anatomy()
    if ([...output.childNodes].some(node => node.nodeType !== 3)) throw new TypeError("Initial code must contain literal text only, not authored markup or another renderer's rows.")
    if (selected(output)) throw new Error("Release the native selection before binding Log text ownership.")
    const initial = options.lines !== undefined ? lineInput(options.lines) : split(normalize(options.text !== undefined ? options.text : output.textContent ?? ""))
    const initialData = allocate(initial); fit(initialData)
    for (const node of [root, viewport, output]) (node as Owned)[owner] = token
    output.replaceChildren()
    commit(initialData, nextKey + initialData.length, false, "replace")
    initialized = true
    setLoading(loading)
    viewport.addEventListener("scroll", scroll, { passive: true })
    if (view.ResizeObserver) {
      observer = new view.ResizeObserver(() => { if (connected) attempt(refresh) })
      observer.observe(viewport)
    }
  } catch (cause) { disconnect(); throw cause }
  const controller: LogController = {
    viewport, output,
    get connected() { return connected }, get error() { return error },
    get text() { return rows.map(row => row.text).join("\n") },
    get lines() { return Object.freeze(rows.map(row => Object.freeze({ key: row.key, text: row.text }))) },
    get state() { const value = metric(); return Object.freeze({ ...update, lineCount: rows.length, characters, totalDroppedLines, generation, follow, trim, loading, atTop: top(value), atBottom: bottom(value) }) },
    append: text => run(() => append(text)),
    flush: () => run(() => append("", true)),
    setText: text => run(() => replace(split(normalize(text)))),
    setLines: lines => run(() => replace(lineInput(lines))),
    trimStart(count) {
      return run(() => {
        if (!Number.isSafeInteger(count) || count < 0 || count >= rows.length) throw new RangeError("trimStart removes 0..lineCount-1 whole leading lines; use clear to reset everything.")
        const result = commit(rows.slice(count), nextKey, pendingCR, "trim")
        totalDroppedLines += count
        update = Object.freeze({ ...result, droppedLines: count })
        return update
      })
    },
    clear() { run(() => { replace([""]); totalDroppedLines = 0 }) },
    setFollow(value) { run(() => { boolean(value); follow = value; remember() }) },
    setTrim(value) { run(() => { boolean(value); commit(rows, nextKey, pendingCR, "trim", value) }) },
    setLoading: value => run(() => setLoading(value)),
    scrollTo(value) {
      run(() => {
        object(value, ["top", "position", "silent"])
        const hasTop = "top" in value, hasPosition = "position" in value
        if (hasTop === hasPosition || hasTop && (typeof value.top !== "number" || !Number.isFinite(value.top))
          || hasPosition && !["top", "bottom"].includes(value.position!) || value.silent !== undefined && typeof value.silent !== "boolean") throw new TypeError("scrollTo needs exactly one finite top or top/bottom position, with optional boolean silent.")
        place(hasTop ? value.top! : value.position === "bottom" ? viewport.scrollHeight : 0, value.silent ?? false)
      })
    },
    refresh, disconnect
  }
  ;(root as OwnedController)[controllerRef] = controller
  return controller
}

const controllerRef = Symbol.for("markup-ui.log.controller")
type OwnedController = HTMLElement & { [controllerRef]?: LogController }

/**
 * A log viewer for bounded, fully retained native text records.
 * @region {"name":"content","accepts":["flow content"],"min":0,"max":null}
 * @event {"name":"LogEdge","web":"m:log-edge","bubbles":true,"cancelable":false,"composed":false,"detail":{"position":"string"}}
 * @event {"name":"LogError","web":"m:log-error","bubbles":true,"cancelable":false,"composed":false}
 */
export class Log extends ViewElement {
  public static readonly tag = "m-log"
  public static get observedAttributes(): string[] {
    return ["line-height", "rows", "trim"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mLog = ""
    this.dataset.log = ""
    this.classList.add("m-log")
    this.ensureAnatomy()
    this.synchronize()
  }

  public disconnectedCallback(): void {
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === "line-height" || name === "rows") {
      this.synchronize()
    }
  }

  /**
   * Line height multiplier for log rows.
   * @min 0
   */
  public get lineHeight(): number {
    return this.numberAttribute("line-height", 1.25)
  }
  public set lineHeight(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      throw new RangeError("lineHeight must be a positive number.")
    }
    this.setAttribute("line-height", String(value))
    this.style.setProperty("--m-log-line-height", String(value))
  }

  /**
   * Number of visible log rows.
   * @min 1
   * @integer
   */
  public get rows(): number {
    return this.numberAttribute("rows", 15)
  }
  public set rows(value: number) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new RangeError("rows must be a positive integer.")
    }
    this.setAttribute("rows", String(value))
    this.style.setProperty("--m-log-rows", String(value))
  }

  /**
   * Whether to trim displayed line whitespace.
   */
  public get trim(): boolean {
    return this.hasAttribute("trim")
  }
  public set trim(value: boolean) {
    this.setBooleanAttribute("trim", value)
  }

  public override scrollTo(options?: LogScrollOptions | ScrollToOptions): void
  public override scrollTo(x: number, y: number): void
  public override scrollTo(
    optionsOrX?: LogScrollOptions | ScrollToOptions | number,
    y?: number,
  ): void {
    const controller = (this as OwnedController)[controllerRef]
    if (typeof optionsOrX === "number") {
      const top = typeof y === "number" ? y : optionsOrX
      if (controller) {
        controller.scrollTo({ top })
      } else {
        const viewport = this.querySelector<HTMLPreElement>("[data-log-viewport]")
        if (viewport) viewport.scrollTop = top
        if (typeof super.scrollTo === "function") {
          super.scrollTo(optionsOrX, y as number)
        }
      }
      return
    }
    if (optionsOrX && typeof optionsOrX === "object") {
      if ("position" in optionsOrX) {
        if (optionsOrX.position !== "top" && optionsOrX.position !== "bottom") {
          throw new TypeError("scrollTo position must be 'top' or 'bottom'.")
        }
        if (controller) {
          controller.scrollTo(optionsOrX as LogScrollOptions)
        } else {
          const viewport = this.querySelector<HTMLPreElement>("[data-log-viewport]")
          if (viewport) {
            viewport.scrollTop = optionsOrX.position === "bottom"
              ? Math.max(0, viewport.scrollHeight - viewport.clientHeight)
              : 0
          }
        }
        return
      }
      if ("top" in optionsOrX && !("left" in optionsOrX)) {
        if (typeof optionsOrX.top !== "number" || !Number.isFinite(optionsOrX.top)) {
          throw new TypeError("scrollTo top must be a finite number.")
        }
        if (controller) {
          controller.scrollTo(optionsOrX as LogScrollOptions)
        } else {
          const viewport = this.querySelector<HTMLPreElement>("[data-log-viewport]")
          if (viewport) viewport.scrollTop = optionsOrX.top
        }
        return
      }
    }
    if (typeof super.scrollTo === "function") {
      super.scrollTo(optionsOrX as ScrollToOptions)
    }
  }

  private ensureAnatomy(): void {
    let viewport = this.querySelector<HTMLPreElement>(":scope > [data-log-viewport]")
    if (!viewport) {
      viewport = this.ownerDocument.createElement("pre")
      viewport.className = "m-code-block"
      viewport.setAttribute("data-log-viewport", "")
      viewport.setAttribute("tabindex", "0")
      viewport.setAttribute("role", "region")
      viewport.setAttribute("aria-label", "Log")
      const code = this.ownerDocument.createElement("code")
      code.className = "m-code"
      code.setAttribute("data-log-output", "")
      const loose = [...this.childNodes].filter(node => node !== viewport)
      if (loose.length) {
        code.append(...loose)
      }
      viewport.append(code)
      this.append(viewport)
    }
  }

  private synchronize(): void {
    if (this.hasAttribute("line-height")) {
      try {
        this.style.setProperty("--m-log-line-height", String(this.lineHeight))
      } catch {
        // Retain authored attributes without throwing in lifecycle
      }
    } else {
      this.style.removeProperty("--m-log-line-height")
    }

    if (this.hasAttribute("rows")) {
      try {
        this.style.setProperty("--m-log-rows", String(this.rows))
      } catch {
        // Retain authored attributes without throwing in lifecycle
      }
    } else {
      this.style.removeProperty("--m-log-rows")
    }
  }
}

export const MLog = Log
