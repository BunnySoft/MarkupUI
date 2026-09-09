export interface DynamicInputRow { readonly key: string; readonly element: HTMLElement }
export interface DynamicInputContext {
  readonly key: string
  readonly index: number
  onCleanup(callback: () => void): void
}
export interface DynamicInputOptions {
  min?: number
  max?: number
  initialize?: (row: HTMLElement, context: DynamicInputContext) => void
  connect?: (row: HTMLElement, context: DynamicInputContext) => void
}
export interface DynamicInputController {
  readonly connected: boolean
  readonly error: unknown
  readonly rows: readonly DynamicInputRow[]
  readonly min: number
  readonly max: number
  add(index?: number): DynamicInputRow | null
  remove(key: string): boolean
  move(key: string, index: number): boolean
  setBounds(min: number, max: number): void
  refresh(): void
  disconnect(): void
}
interface Row { public: DynamicInputRow; cleanups: (() => void)[] }
interface Attribute { node: HTMLElement; row: HTMLElement | null; name: string; before: string | null; base: string | null; last: string | null }
const owner = Symbol.for("markup-ui.dynamic-input.owner")
type Owned = Element & { [owner]?: DynamicInputController }
type Action = "add" | "remove" | "up" | "down"

/** Repeats authored native rows, never a value model or an input renderer. */
export function createDynamicInput(root: HTMLElement, options: DynamicInputOptions = {}): DynamicInputController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches("[data-dynamic-input]")) throw new TypeError("Dynamic Input needs an authored data-dynamic-input root.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["min", "max", "initialize", "connect"].includes(key))
    || options.min !== undefined && typeof options.min !== "number"
    || options.max !== undefined && typeof options.max !== "number"
    || options.initialize !== undefined && typeof options.initialize !== "function"
    || options.connect !== undefined && typeof options.connect !== "function") throw new TypeError("Unsupported Dynamic Input options.")
  let min = options.min ?? 0, max = options.max ?? 20
  function bounds(lower: number, upper: number) {
    if (!Number.isInteger(lower) || !Number.isInteger(upper) || lower < 0 || upper < 1 || lower > upper || upper > 100) throw new RangeError("Use 0 <= min <= max <= 100, with max at least 1.")
  }
  bounds(min, max)
  const own = (node: Element) => node.closest("[data-dynamic-input]") === root
  function one(selector: string) {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length !== 1) throw new TypeError(`Author exactly one owned ${selector}.`)
    return nodes[0]!
  }
  const container = one("[data-dynamic-rows]"), templateNode = one("[data-dynamic-template]"), addNode = one("[data-dynamic-add]")
  if (!(templateNode instanceof view.HTMLTemplateElement) || !(addNode instanceof view.HTMLButtonElement)
    || container === templateNode || container.contains(templateNode) || container.contains(addNode)) throw new TypeError("Keep the row container, native template and global add button separate.")
  const template = templateNode, addButton = addNode
  const initialize = options.initialize, connect = options.connect
  let connected = true, busy = false, sequence = 0, generation = 0, error: unknown = null
  const attributes: Attribute[] = [], tasks = new Set<number>()
  const initialKeys = new Set<string>(), removers: (() => void)[] = []
  function children() { return [...container.children] as HTMLElement[] }
  function key(element: HTMLElement) {
    const value = element.getAttribute("data-dynamic-key")
    if (!value || value.length > 128) throw new TypeError("Each current row needs a nonempty stable key of at most 128 characters.")
    return value
  }
  let records: Row[] = children().map(element => {
    const value = key(element)
    if (initialKeys.has(value)) throw new TypeError("Dynamic Input row keys must be unique.")
    initialKeys.add(value)
    return { public: Object.freeze({ key: value, element }), cleanups: [] }
  })
  const local = (node: Element, row: HTMLElement) => node.closest("[data-dynamic-row]") === row
    && node.closest("[data-dynamic-input]") === row.closest("[data-dynamic-input]")
  function actions(row: HTMLElement) { return [...row.querySelectorAll<HTMLElement>("[data-dynamic-action]")].filter(node => local(node, row)) }
  function button(node: HTMLElement, initial = false) {
    if (!(node instanceof view!.HTMLButtonElement) || node.getAttribute("type")?.toLowerCase() !== "button"
      || !(node.getAttribute("aria-label")?.trim() || node.textContent?.trim())
      || node.hasAttribute("role") || node.getAttribute("aria-hidden") === "true" || node.hasAttribute("popovertarget") || node.hasAttribute("commandfor")
      || node.parentElement?.closest("label, button, a[href], summary")
      || node.querySelector("input, button, select, textarea, a[href], [tabindex], [contenteditable], [role]")
      || initial && !node.hidden) throw new TypeError("Dynamic actions need labelled hidden type=button controls outside other interaction; enhancement reveals them.")
  }
  function rowAnatomy(row: HTMLElement, initial = false) {
    if (!(row instanceof view!.HTMLElement) || !row.hasAttribute("data-dynamic-row")
      || ["data-dynamic-input", "data-dynamic-action", "data-dynamic-add"].some(name => row.hasAttribute(name))) throw new TypeError("Each direct container child must be a native data-dynamic-row, not a root or action.")
    const seen = new Set<string>()
    for (const node of actions(row)) {
      const action = node.getAttribute("data-dynamic-action")!
      if (!["add", "remove", "up", "down"].includes(action) || seen.has(action)) throw new TypeError("Use at most one add/remove/up/down button per row.")
      seen.add(action); button(node, initial)
    }
  }
  function noIds(scope: ParentNode) {
    if (scope.querySelector("[id]")) throw new TypeError("Template content must have no IDs; assign unique IDs/references in initialize if needed.")
    for (const nested of scope.querySelectorAll("template")) noIds(nested.content)
  }
  function templateAnatomy() {
    if (template.content.children.length !== 1) throw new TypeError("The template needs exactly one native row element.")
    const prototype = template.content.firstElementChild as HTMLElement
    noIds(template.content)
    if (prototype.hasAttribute("data-dynamic-key")) throw new TypeError("Do not author a key on the template row.")
    rowAnatomy(prototype, true)
  }
  function ids(row: HTMLElement) {
    for (const nested of row.querySelectorAll("template")) noIds(nested.content)
    const elements = [row, ...row.querySelectorAll<HTMLElement>("*")], seen = new Set<string>()
    const documentIds = [...document!.querySelectorAll("[id]")]
    for (const element of elements) if (element.hasAttribute("id")) {
      if (!element.id || /\s/.test(element.id) || seen.has(element.id)
        || documentIds.some(node => node !== element && node.id === element.id)) throw new TypeError("Row IDs must be nonempty, whitespace-free and unique in the document.")
      seen.add(element.id)
    }
    const available = new Set([...documentIds.map(node => node.id), ...seen])
    for (const element of elements) {
      for (const name of ["for", "list", "form", "headers", "aria-labelledby", "aria-describedby", "aria-controls", "aria-details", "aria-errormessage", "aria-owns", "aria-flowto"]) {
        const references = element.getAttribute(name)?.trim().split(/\s+/).filter(Boolean) ?? []
        if (references.some(id => !available.has(id))) throw new TypeError("Initialize row ID references explicitly; external references must resolve. Names are never rewritten.")
      }
      const href = element.getAttribute("href")
      if (href?.startsWith("#") && href.length > 1 && !available.has(decodeURIComponent(href.slice(1)))) throw new TypeError("Row fragment references must resolve; no automatic remapping.")
    }
  }
  function structure() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches("[data-dynamic-input]")
      || root.closest("label, button, a[href], summary")
      || [container, template, addButton].some(node => !root.contains(node) || !own(node))
      || one("[data-dynamic-rows]") !== container || one("[data-dynamic-template]") !== template || one("[data-dynamic-add]") !== addButton) throw new Error("Keep the original connected root/container/template/add anatomy.")
    const rows = children()
    if (rows.length < min || rows.length > max || rows.length !== records.length
      || rows.some(row => !records.some(record => record.public.element === row))) throw new Error("Row count is outside bounds or contains removed/unowned rows; no implicit adoption or resurrection.")
    for (const record of records) {
      if (!own(record.public.element) || key(record.public.element) !== record.public.key) throw new Error("Do not change row keys or transfer rows between owners.")
      rowAnatomy(record.public.element); ids(record.public.element)
      const actual = actions(record.public.element)
      const leased = attributes.filter(attribute => attribute.name === "hidden" && attribute.row === record.public.element)
      if (attributes.length && (actual.length !== leased.length || actual.some(node => !leased.some(attribute => attribute.node === node)))) {
        throw new Error("Keep original action nodes; initialize action anatomy before connect.")
      }
    }
    records = rows.map(row => records.find(record => record.public.element === row)!)
    button(addButton); templateAnatomy()
  }
  function mark(changes: MutationRecord[]) {
    for (const change of changes) {
      const record = attributes.find(record => record.node === change.target && record.name === change.attributeName)
      if (record) record.before = record.base = record.last = record.node.getAttribute(record.name)
    }
  }
  const observer = new view.MutationObserver(changes => {
    mark(changes)
    try { refresh() } catch { /* refresh reports the error and disconnects; no success is fabricated. */ }
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (connected) observer.observe(document!, { childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["id", "hidden", "disabled", "inert", "role", "type", "class", "style", "aria-label", "aria-labelledby",
        "for", "list", "form", "data-dynamic-input", "data-dynamic-row", "data-dynamic-key", "data-dynamic-action", "data-dynamic-add"] })
  }
  function lease(node: HTMLElement, row: HTMLElement | null) {
    button(node, true)
    for (const name of ["hidden", "disabled"]) {
      const before = node.getAttribute(name)
      attributes.push({ node, row, name, before, base: name === "hidden" ? null : before, last: before })
    }
  }
  function write(record: Attribute, value: string | null) {
    if (record.node.getAttribute(record.name) !== value) {
      if (value === null) record.node.removeAttribute(record.name)
      else record.node.setAttribute(record.name, value)
    }
    record.last = value
  }
  function available(node: HTMLElement) {
    if (!node.isConnected || node.matches(":disabled") || node.closest("[hidden], [inert]")
      || node instanceof view!.HTMLInputElement && node.type === "hidden") return false
    for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
      const style = view!.getComputedStyle(parent)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function candidates(row: HTMLElement | undefined) {
    const selector = "input, select, textarea, button, a[href], [tabindex]"
    return row ? [row, ...row.querySelectorAll<HTMLElement>(selector)]
      .filter(node => node.matches(selector) && local(node, row) && node.tabIndex >= 0 && !node.hasAttribute("data-dynamic-action") && available(node)) : []
  }
  function focus(nodes: HTMLElement[], previous: Element | null) {
    if (!connected || document!.activeElement !== previous) return
    for (const node of nodes) {
      if (!available(node)) continue
      node.focus({ preventScroll: true })
      if (!connected || document!.activeElement !== previous) return
    }
  }
  function syncActions(skipFocus: HTMLElement | null = null) {
    const previous = document!.activeElement
    for (const item of attributes) {
      const action = item.node === addButton ? "add" : item.node.getAttribute("data-dynamic-action")
      const row = records.find(record => record.public.element.contains(item.node) && local(item.node, record.public.element))
      const index = row ? records.indexOf(row) : -1
      const barred = action === "add" ? records.length >= max : action === "remove" ? records.length <= min
        : action === "up" ? index === 0 : action === "down" ? index === records.length - 1 : true
      write(item, item.name === "hidden" ? item.base : barred ? item.base ?? "" : item.base)
    }
    if (previous instanceof view!.HTMLElement && previous !== skipFocus && attributes.some(item => item.node === previous) && !available(previous)) {
      const index = records.findIndex(record => record.public.element.contains(previous))
      const current = document!.activeElement
      if (current === previous || current === document!.body) focus([...candidates(records[index]?.public.element), ...candidates(records[index + 1]?.public.element),
        ...candidates(records[index - 1]?.public.element), addButton], current)
      if (document!.activeElement === previous) previous.blur()
    }
  }
  function report(reason: unknown, operation: string, committed: boolean) {
    error = reason
    root.dispatchEvent(new view!.CustomEvent("mui:dynamic-input-error", { detail: { error: reason, operation, committed } }))
  }
  function synchronous(result: unknown, operation: string, committed = false) {
    if (result === undefined) return
    if (result && typeof (result as PromiseLike<unknown>).then === "function") {
      void Promise.resolve(result).catch(reason => report(reason, operation, committed))
    }
    throw new TypeError(`${operation} must be synchronous and return void; register resource cleanup with onCleanup.`)
  }
  function trackActions(callback: () => void) {
    const watcher = new view!.MutationObserver(() => {})
    for (const node of new Set(attributes.map(attribute => attribute.node))) watcher.observe(node, { attributes: true, attributeFilter: ["hidden", "disabled"] })
    try { callback() } finally { mark(watcher.takeRecords()); watcher.disconnect() }
  }
  function hook(callback: DynamicInputOptions["initialize"], row: Row, index: number, operation: string) {
    if (!callback) return
    let registering = true
    const context: DynamicInputContext = Object.freeze({ key: row.public.key, index, onCleanup(cleanup: () => void) {
      if (!registering || typeof cleanup !== "function") throw new TypeError("Register synchronous cleanup functions while the lifecycle hook runs.")
      row.cleanups.push(cleanup)
    } })
    try { trackActions(() => synchronous(callback(row.public.element, context), operation)) } finally { registering = false }
  }
  function cleanup(row: Row, committed = false) {
    const errors: unknown[] = []
    for (const callback of row.cleanups.splice(0).reverse()) {
      try { trackActions(() => synchronous(callback(), "cleanup", committed)) } catch (reason) { errors.push(reason) }
    }
    return errors
  }
  function restore(row?: HTMLElement) {
    for (let index = attributes.length - 1; index >= 0; index--) {
      const item = attributes[index]!
      if (row && item.row !== row) continue
      if (item.node.getAttribute(item.name) === item.last) {
        if (item.before === null) item.node.removeAttribute(item.name)
        else item.node.setAttribute(item.name, item.before)
      }
      attributes.splice(index, 1)
    }
  }
  function ready() {
    if (busy) throw new Error("Do not reenter collection operations during a structural/lifecycle transaction.")
    if (!connected) throw new Error("Dynamic Input is disconnected.")
    refresh()
    if (!connected) throw new Error("Dynamic Input was disconnected during refresh.")
  }
  function refresh() {
    if (busy) throw new Error("Do not refresh during a lifecycle transaction.")
    if (!connected) return
    pause()
    try { structure(); syncActions(); error = null }
    catch (reason) {
      let failure = reason
      try { disconnect() } catch (cleanupError) { failure = new AggregateError([reason, cleanupError], "Invalid collection and cleanup failure.") }
      report(failure, "refresh", false); throw failure
    } finally { observe() }
  }
  function changed(type: string, row: Row, index: number, previousIndex: number | null, skipFocus: HTMLElement | null = null) {
    const version = ++generation
    pause(); busy = true
    try { syncActions(skipFocus) } finally { busy = false; observe() }
    error = null
    root.dispatchEvent(new view!.CustomEvent("mui:dynamic-input-change", { detail: Object.freeze({
      type, row: row.public, index, previousIndex, rows: Object.freeze(records.map(record => record.public)),
    }) }))
    return version
  }
  function insert(index: number, focusFrom: HTMLElement | null): DynamicInputRow | null {
    ready()
    if (!Number.isInteger(index) || index < 0 || index > records.length) throw new RangeError("Insertion index must be within current rows.")
    if (records.length >= max) return null
    pause(); busy = true
    let row: Row | null = null
    try {
      let id: string
      do { id = `row-${++sequence}` } while (initialKeys.has(id) || records.some(record => record.public.key === id))
      const fragment = document!.importNode(template.content, true), element = fragment.firstElementChild as HTMLElement
      element.setAttribute("data-dynamic-key", id)
      row = { public: Object.freeze({ key: id, element }), cleanups: [] }
      hook(initialize, row, index, "initialize")
      structure()
      if (element.parentNode !== fragment || key(element) !== id) throw new Error("Initialize only the detached row, retaining its key and template root.")
      rowAnatomy(element, true); ids(element)
      if (element.hasAttribute("autofocus") || element.querySelector("[autofocus]")) throw new TypeError("New rows must not autofocus; user add actions provide explicit focus.")
      if ([element, ...element.querySelectorAll("input")].some(input => input instanceof view!.HTMLInputElement && input.type === "radio" && input.checked)) throw new TypeError("New radio controls must be unchecked; choose native group selection after a committed add.")
      for (const action of actions(element)) lease(action, element)
      Object.defineProperty(element, owner, { value: api, configurable: true })
      container.insertBefore(element, records[index]?.public.element ?? null)
      records.splice(index, 0, row)
      hook(connect, row, index, "connect")
      structure()
    } catch (reason) {
      const failures = row ? cleanup(row) : []
      if (row) {
        const element = row.public.element
        element.remove()
        records = records.filter(record => record !== row)
        restore(element)
        if ((element as Owned)[owner] === api) delete (element as Owned)[owner]
      }
      try { structure(); syncActions() } catch (integrityError) {
        failures.push(integrityError); busy = false
        try { disconnect() } catch (cleanupError) { failures.push(cleanupError) }
      }
      const failure = failures.length ? new AggregateError([reason, ...failures], "Add rolled back; lifecycle cleanup also failed.") : reason
      report(failure, "add", false); throw failure
    } finally { busy = false; observe() }
    const version = changed("add", row!, index, null, focusFrom)
    if (focusFrom && connected && generation === version
      && (document!.activeElement === focusFrom || document!.activeElement === document!.body)) {
      focus([...candidates(row!.public.element), ...candidates(records[index + 1]?.public.element),
        ...candidates(records[index - 1]?.public.element), addButton], document!.activeElement)
    }
    return row!.public
  }
  function add(index = records.length) { return insert(index, null) }
  function find(key: string) {
    const index = records.findIndex(record => record.public.key === key)
    if (index < 0) throw new RangeError("Unknown stable row key.")
    return index
  }
  function remove(key: string) {
    ready()
    const index = find(key), row = records[index]!
    if (records.length <= min) return false
    const active = document!.activeElement, recovering = row.public.element.contains(active)
    pause(); busy = true
    let failures: unknown[]
    try {
      row.public.element.remove(); records.splice(index, 1)
      failures = cleanup(row, true); restore(row.public.element)
      if ((row.public.element as Owned)[owner] === api) delete (row.public.element as Owned)[owner]
    } finally { busy = false; observe() }
    const version = changed("remove", row, index, index)
    if (recovering && version === generation && document!.activeElement === document!.body) {
      focus([...candidates(records[index]?.public.element), ...candidates(records[index - 1]?.public.element), addButton], document!.body)
    }
    if (failures.length) { const failure = new AggregateError(failures, "Row removed, but resource cleanup failed."); report(failure, "remove", true); throw failure }
    return true
  }
  function move(key: string, index: number) {
    ready()
    const previousIndex = find(key), row = records[previousIndex]!
    if (!Number.isInteger(index) || index < 0 || index >= records.length) throw new RangeError("Move index must be within current rows.")
    if (previousIndex === index) return false
    const active = document!.activeElement, recovering = row.public.element.contains(active)
    const field = active instanceof view!.HTMLInputElement || active instanceof view!.HTMLTextAreaElement ? active : null
    const selection = field ? { start: field.selectionStart, end: field.selectionEnd, direction: field.selectionDirection, value: field.value } : null
    const next = [...records]; next.splice(previousIndex, 1); next.splice(index, 0, row)
    pause(); busy = true
    let moved = false
    try {
      const before = next[index + 1]?.public.element ?? null
      const mover = (container as HTMLElement & { moveBefore?: (node: Node, child: Node | null) => void }).moveBefore
      if (typeof mover === "function") mover.call(container, row.public.element, before)
      else container.insertBefore(row.public.element, before)
      moved = true; records = next; structure()
    } catch (reason) {
      busy = false
      let failure = reason
      try { disconnect() } catch (cleanupError) { failure = new AggregateError([reason, cleanupError], "Move and cleanup failed.") }
      report(failure, "move", moved); throw failure
    } finally { busy = false; observe() }
    const version = changed("move", row, index, previousIndex)
    if (connected && version === generation && recovering && active instanceof view!.HTMLElement) {
      if (document!.activeElement === document!.body) focus(available(active) ? [active] : [...candidates(row.public.element), addButton], document!.body)
      if (document!.activeElement === active && field && selection?.start !== null && selection?.start !== undefined
        && selection.end !== null && field.value === selection.value) field.setSelectionRange(selection.start, selection.end, selection.direction ?? undefined)
    }
    return true
  }
  function setBounds(lower: number, upper: number) {
    ready(); bounds(lower, upper)
    if (records.length < lower || records.length > upper) throw new RangeError("New bounds must contain current rows; no implicit allocation/removal.")
    min = lower; max = upper; refresh()
  }
  function disconnect() {
    if (busy) throw new Error("Do not disconnect during a lifecycle transaction.")
    if (!connected) return
    pause(); connected = false; generation++
    removers.splice(0).forEach(remove => remove())
    tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    busy = true
    const failures = records.flatMap(row => cleanup(row, true))
    busy = false
    restore()
    for (const node of [root, container, template, addButton, ...records.map(record => record.public.element)]) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
    if (failures.length) throw new AggregateError(failures, "Dynamic Input disconnected, but resource cleanup failed.")
  }
  const api: DynamicInputController = { get connected() { return connected }, get error() { return error },
    get rows() { return Object.freeze(records.map(record => record.public)) }, get min() { return min }, get max() { return max },
    add, remove, move, setBounds, refresh, disconnect }
  structure()
  for (const node of [root, container, template, addButton, ...records.map(record => record.public.element)]) if ((node as Owned)[owner]) throw new Error("Dynamic Input node already has an owner.")
  button(addButton, true); records.forEach(record => rowAnatomy(record.public.element, true))
  try {
    for (const node of [root, container, template, addButton, ...records.map(record => record.public.element)]) Object.defineProperty(node, owner, { value: api, configurable: true })
    lease(addButton, null)
    for (const row of records) for (const action of actions(row.public.element)) lease(action, row.public.element)
    busy = true
    records.forEach((row, index) => hook(connect, row, index, "connect"))
    busy = false
    refresh()
  } catch (reason) {
    busy = false
    try { disconnect() } catch (cleanupError) { throw new AggregateError([reason, cleanupError], "Initialization and cleanup failed.") }
    throw reason
  }
  const click = (event: Event) => {
    const node = event.target instanceof view!.Element ? event.target.closest<HTMLElement>("[data-dynamic-action], [data-dynamic-add]") : null
    if (!node || !own(node)) return
    const row = records.find(record => record.public.element.contains(node) && local(node, record.public.element))
    const action = node === addButton ? "add" : node.getAttribute("data-dynamic-action") as Action
    if (node !== addButton && !row) return
    const id = view!.setTimeout(() => {
      tasks.delete(id)
      if (!connected || event.defaultPrevented || !available(node) || !own(node)
        || (node === addButton ? !node.hasAttribute("data-dynamic-add") : node.getAttribute("data-dynamic-action") !== action || !row?.public.element.contains(node))) return
      const active = document!.activeElement
      try {
        ready()
        if (!available(node)) return
        if (action === "add") {
          insert(row ? find(row.public.key) + 1 : records.length, active === node ? node : null)
        } else if (action === "remove") remove(row!.public.key)
        else { const index = find(row!.public.key); move(row!.public.key, index + (action === "up" ? -1 : 1)) }
      } catch (reason) { if (error !== reason) report(reason, action, false) }
    }, 0)
    tasks.add(id)
  }
  root.addEventListener("click", click)
  removers.push(() => root.removeEventListener("click", click))
  return api
}
