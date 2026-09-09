import { readTreeHierarchy, treeLabel } from "../tree/hierarchy.js"
import type { TreeHierarchy, TreeNode } from "../tree/hierarchy.js"
import type { TreeLoadResult } from "../tree/tree.js"

export interface CascaderOptions {
  selection?: "leaf" | "any"
  value?: string | null
  defaultValue?: string | null
  showPath?: boolean
  separator?: string
  load?: (node: TreeNode, context: { signal: AbortSignal }) => TreeLoadResult | Promise<TreeLoadResult>
}
export interface CascaderState {
  readonly path: readonly string[]
  readonly value: string | null
  readonly complete: boolean
  readonly pending: boolean
  readonly valid: boolean
  readonly defaultPath: readonly string[]
  readonly defaultValid: boolean
}
export interface CascaderController {
  readonly connected: boolean
  readonly error: unknown
  readonly state: CascaderState
  readonly controls: readonly HTMLSelectElement[]
  setValue(value: string | null): void
  setPath(path: readonly string[]): void
  setDefaultValue(value: string | null): void
  clear(): boolean
  load(): Promise<boolean>
  refresh(): void
  disconnect(): void
}
interface Attribute { element: HTMLElement; name: string; before: string | null; last: string | null }
interface Text { element: HTMLElement; before: string; last: string }
interface Option {
  element: HTMLOptionElement
  key: string
  original: boolean
  before: { text: string; label: string | null; disabled: boolean; defaultSelected: boolean }
  last: { text: string; label: string | null; disabled: boolean; defaultSelected: boolean }
}
interface Column {
  wrapper: HTMLElement
  control: HTMLSelectElement
  placeholder: HTMLOptionElement
  original: ChildNode[]
  selected: HTMLOptionElement | null
  options: Map<string, Option>
  active: boolean
}
interface Gate { control: HTMLSelectElement; before: string; last: string }
interface Job { node: TreeNode; generation: number; abort: AbortController; promise: Promise<boolean>; resolve(value: boolean): void; reject(error: unknown): void }
const owner = Symbol.for("markup-ui.cascader.owner")
const selectOwner = Symbol.for("markup-ui.select.owner")
const treeOwner = Symbol.for("markup-ui.tree.owner")
type Owned = Element & { [owner]?: object; [selectOwner]?: object; [treeOwner]?: object }

/** Projects one authored native hierarchy into a fixed set of native dependent selects. */
export function createCascader(root: HTMLElement, options: CascaderOptions = {}): CascaderController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches(".mui-cascader[data-cascader]")
    || !["div", "section", "fieldset"].includes(root.localName)) throw new TypeError("Cascader needs an authored native .mui-cascader[data-cascader] root.")
  if ((root as Owned)[owner]) throw new Error("Cascader already has an owner.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["selection", "value", "defaultValue", "showPath", "separator", "load"].includes(key))
    || options.showPath !== undefined && typeof options.showPath !== "boolean"
    || options.load !== undefined && typeof options.load !== "function") throw new TypeError("Unsupported Cascader options.")
  const selection = options.selection === undefined ? "leaf" : options.selection
  const showPath = options.showPath ?? true, separator = options.separator === undefined ? " / " : options.separator, loader = options.load
  if (!["leaf", "any"].includes(selection) || typeof separator !== "string" || separator.length > 32) throw new TypeError("Use leaf/any selection and a separator of at most 32 characters.")
  const own = (element: Element) => element.closest("[data-cascader]") === root
  const query = (selector: string) => [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
  function one(selector: string, required = false) {
    const nodes = query(selector)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const source = one("[data-cascader-source]", true)!, readout = one("[data-cascader-path]"), status = one("[data-cascader-status]")
  const clearNode = one("[data-cascader-clear]")
  if (clearNode && (!(clearNode instanceof view.HTMLButtonElement) || clearNode.type !== "button" || !clearNode.textContent?.trim()
    || clearNode.hasAttribute("role") || clearNode.hasAttribute("popovertarget") || clearNode.hasAttribute("commandfor")
    || clearNode.closest("label,summary") || clearNode.querySelector("input,select,textarea,button,a,[tabindex]"))) throw new TypeError("Clear needs a labelled native type=button, separate from fields.")
  const clearButton = clearNode as HTMLButtonElement | null
  if ([readout, status].some(node => node && (node.childElementCount || node.matches("label,button,input,select,textarea") || node.closest("label,button,summary")))
    || readout && readout === status || [readout, status, clearButton].some(node => node && source.contains(node))) throw new TypeError("Path/status/actions must be separate from source data and native labels.")
  const wrappers = query("[data-cascader-column]")
  if (!wrappers.length || wrappers.length > 8) throw new RangeError("Author one to eight native Cascader columns.")
  const columns: Column[] = wrappers.map(wrapper => {
    const controls = [...wrapper.querySelectorAll<HTMLSelectElement>("select[data-cascader-control]")].filter(own)
    const control = controls[0]
    if (controls.length !== 1 || !control || control.multiple || control.size > 1 || control.hasAttribute("role") || control.hasAttribute("readonly")
      || ![...control.labels ?? []].some(label => label.textContent?.trim())) throw new TypeError("Each column needs one labelled native single select.")
    const elements = [...control.children], placeholder = elements[0]
    if (!(placeholder instanceof view.HTMLOptionElement) || placeholder.value !== "" || !placeholder.hasAttribute("value")
      || !placeholder.textContent?.trim() || placeholder.disabled
      || elements.some(node => !(node instanceof view.HTMLOptionElement) || !node.hasAttribute("value") || node.childElementCount)
      || new Set(elements.map(node => (node as HTMLOptionElement).value)).size !== elements.length) throw new TypeError("Use direct plain-text options, unique explicit values and a first enabled empty placeholder.")
    const records = new Map<string, Option>()
    for (const option of elements as HTMLOptionElement[]) {
      const before = { text: option.textContent ?? "", label: option.getAttribute("label"), disabled: option.disabled, defaultSelected: option.defaultSelected }
      records.set(option.value, { element: option, key: option.value, original: true, before, last: { ...before } })
    }
    return { wrapper, control, placeholder, original: [...control.childNodes], selected: control.selectedOptions[0] ?? null, options: records, active: true }
  })
  if (new Set(columns.map(column => column.control)).size !== columns.length
    || query("[data-cascader-control]").length !== columns.length
    || columns.some(column => source.contains(column.control) || column.wrapper.contains(source))) throw new TypeError("Keep source and distinct column controls separate.")
  const controls = Object.freeze(columns.map(column => column.control)), form = controls[0]!.form
  const optionIndex = new Map<string, Option>()
  for (const column of columns) for (const [key, record] of column.options) if (key) {
    if (optionIndex.has(key)) throw new TypeError("An authored option key belongs to exactly one hierarchy level.")
    optionIndex.set(key, record)
  }
  const token = {}, attributes: Attribute[] = [], texts: Text[] = [], gates: Gate[] = []
  const borrowed = new Set<HTMLElement>(), batches = new Set<TreeLoadResult>()
  let connected = true, busy = false, generation = 0, error: unknown = null, fault = ""
  let sourceFault = false, resetFault = false, refreshing = false
  let path: string[] = [], defaults: string[] = [], hierarchy: TreeHierarchy
  let job: Job | null = null, resetPending = false, defaultsChanged = false
  let resetToken = 0, reports = 0
  const resetEvents: Event[] = []
  const timers = new Set<number>()
  function live() { if (!connected) throw new Error("Cascader is disconnected.") }
  function currentMessage(control: HTMLSelectElement) { return control.validity.customError ? control.validationMessage : "" }
  function attr(element: HTMLElement, name: string, value: string | null) {
    let lease = attributes.find(item => item.element === element && item.name === name)
    if (!lease) { lease = { element, name, before: element.getAttribute(name), last: element.getAttribute(name) }; attributes.push(lease) }
    else if (element.getAttribute(name) !== lease.last) lease.before = element.getAttribute(name)
    if (value === null) element.removeAttribute(name)
    else element.setAttribute(name, value)
    lease.last = value
  }
  function base(element: HTMLElement, name: string) {
    const lease = attributes.find(item => item.element === element && item.name === name)
    return lease ? lease.before : element.getAttribute(name)
  }
  function text(element: HTMLElement | null, value: string) {
    if (!element || !root.contains(element) || !own(element) || element.childElementCount) return
    let lease = texts.find(item => item.element === element)
    if (!lease) { lease = { element, before: element.textContent ?? "", last: element.textContent ?? "" }; texts.push(lease) }
    if (element.textContent !== lease.last) lease.before = element.textContent ?? ""
    if (element.textContent !== value) element.textContent = value
    lease.last = value
  }
  function validateSource(addition?: { list: Element; nodes: readonly HTMLLIElement[] }) {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-cascader[data-cascader]")
      || root.hasAttribute("role") || !root.contains(source) || !own(source)
      || one("[data-cascader-source]", true) !== source
      || query("[data-cascader-column]").length !== columns.length || query("[data-cascader-column]").some((element, level) => element !== columns[level]!.wrapper)
      || query("[data-cascader-control]").length !== controls.length
      || [readout, status, clearButton].some(node => node && (!root.contains(node) || !own(node)))
      || [readout, status].some(node => node && (node.childElementCount || node.closest("label,button,summary")))
      || controls.some((control, i) => !root.contains(control) || !columns[i]!.wrapper.contains(control)
        || !own(control) || !control.hasAttribute("data-cascader-control") || control.form !== form || control.multiple || control.size > 1 || control.hasAttribute("role") || control.hasAttribute("readonly")
        || ![...control.labels ?? []].some(label => label.textContent?.trim()))) throw new TypeError("Keep the connected original native source/columns and one shared native form owner.")
    if ((source as Owned)[treeOwner] && (source as Owned)[treeOwner] !== token
      || source.querySelector("input,select,textarea,button,script,style,link,iframe,object,embed,[is],[data-tree-select],[contenteditable]:not([contenteditable=false]),[data-tree]")
      || source.hasAttribute("data-tree-select")) throw new TypeError("Use an unbound static Tree hierarchy with span labels and no source form controls or nested Tree owners.")
    const next = readTreeHierarchy(source, addition)
    for (const node of next.nodes) {
      let depth = 0
      for (let current: TreeNode | null = node; current; current = current.parent) depth++
      if (depth > columns.length || node.label.localName !== "span" || node.checkbox || treeLabel(node).length > 1024
        || [node.element, node.label, node.branch, node.summary].some(element => element
          && ((element as Owned)[treeOwner] && (element as Owned)[treeOwner] !== token
            || (element as Owned)[owner] && (element as Owned)[owner] !== token))) throw new TypeError("Source nodes need plain span labels (<=1024 characters), no competing owner and depth within authored columns.")
      if (node.branch?.hasAttribute("data-tree-lazy") && depth === columns.length) throw new RangeError("A lazy branch needs another authored column for its children.")
    }
    return next
  }
  function unavailable(node: TreeNode) {
    if (source.hasAttribute("data-tree-disabled")) return true
    for (let current: TreeNode | null = node; current; current = current.parent) {
      if (current.element.hasAttribute("data-tree-disabled")) return true
      const record = optionIndex.get(current.key)
      if (record?.before.disabled) return true
    }
    return false
  }
  function prefix(keys: readonly string[], index = hierarchy) {
    const result: string[] = []
    let parent: TreeNode | null = null
    for (const key of keys) {
      const node = index.byKey.get(key)
      if (!node || node.parent !== parent || unavailable(node)) break
      result.push(key); parent = node
    }
    return result
  }
  function validatePath(keys: readonly string[]) {
    if (!Array.isArray(keys) || keys.length > columns.length || keys.some(key => typeof key !== "string" || !key)
      || new Set(keys).size !== keys.length || prefix(keys).length !== keys.length) throw new TypeError("Use a known enabled contiguous path of unique native string keys.")
    return [...keys]
  }
  function terminal(keys = path) {
    const node = hierarchy.byKey.get(keys.at(-1) ?? "")
    return !!node && (selection === "any" || node.branch === null)
  }
  function valuePath(value: string | null) {
    if (value === null) return []
    if (typeof value !== "string" || !value) throw new TypeError("Cascader value is a nonempty native string key or null, never an array/number.")
    const node = hierarchy.byKey.get(value)
    if (!node) throw new RangeError("Unknown Cascader value.")
    const keys: string[] = []
    for (let current: TreeNode | null = node; current; current = current.parent) keys.unshift(current.key)
    validatePath(keys)
    if (!terminal(keys)) throw new RangeError("This selection policy requires a known terminal leaf.")
    return keys
  }
  function nativePath(useDefaults = false) {
    const values = columns.map(column => {
      if (!useDefaults) return column.active ? column.control.value : ""
      const selected = [...column.control.options].filter(option => option.defaultSelected)
      if (selected.length > 1) throw new TypeError("Author at most one defaultSelected option per native column.")
      return selected[0]?.value ?? column.placeholder.value
    })
    while (values.at(-1) === "") values.pop()
    return values
  }
  function defaultValid() { return prefix(defaults).length === defaults.length }
  function available(control: HTMLElement) {
    if (!control.isConnected || control.matches(":disabled") || control.closest("[hidden],[inert]")) return false
    for (let element: HTMLElement | null = control; element; element = element.parentElement) {
      const style = view!.getComputedStyle(element)
      if (style.display === "none" || style.visibility === "hidden") return false
      if (element.localName === "details" && !(element as HTMLDetailsElement).open && !element.firstElementChild?.contains(control)) return false
    }
    return true
  }
  function focus(control: HTMLElement | undefined) { if (control && available(control)) { control.focus({ preventScroll: true }); live() } }
  function gate() {
    const target = columns.find(column => column.active && column.control.willValidate)?.control ?? controls[0]!
    const message = fault || (resetPending ? "Restoring the Cascader default path…" : path.length && !terminal() ? "Choose a complete Cascader path before submitting." : "")
    for (const control of controls) {
      let lease = gates.find(item => item.control === control)
      if (!lease) { lease = { control, before: currentMessage(control), last: currentMessage(control) }; gates.push(lease) }
      if (currentMessage(control) !== lease.last) lease.before = currentMessage(control)
      const value = lease.before || (control === target ? message : "")
      if (currentMessage(control) !== value) control.setCustomValidity(value)
      lease.last = value
    }
  }
  function snapshot(): CascaderState {
    const complete = !fault && !resetEvents.some(event => !event.defaultPrevented) && terminal()
    return Object.freeze({
      path: Object.freeze([...path]), value: complete ? path.at(-1)! : null, complete, pending: !!job || resetPending,
      valid: connected && (!controls.some(control => control.willValidate) || !fault && (!path.length || complete) && controls.every(control => !control.willValidate || control.validity.valid)),
      defaultPath: Object.freeze([...defaults]), defaultValid: defaultValid(),
    })
  }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["data-cascader", "data-cascader-source", "data-cascader-column", "data-cascader-control", "data-tree-key", "data-tree-lazy",
        "data-tree-disabled", "data-tree-label", "data-tree-row", "data-tree-list", "data-tree-branch", "data-tree", "disabled", "required",
        "hidden", "inert", "value", "label", "selected", "name", "form", "role", "multiple", "size", "id", "for", "class", "style", "aria-labelledby", "aria-label"] })
    for (let parent = root.parentElement; parent; parent = parent.parentElement) observer.observe(parent, { childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"] })
  }
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      if (record.attributeName === "selected" && record.target instanceof view!.HTMLOptionElement
        && columns.some(column => column.control.contains(record.target))) defaultsChanged = true
      const lease = attributes.find(item => item.element === record.target && item.name === record.attributeName)
      if (lease) lease.before = lease.last = lease.element.getAttribute(lease.name)
    }
    for (const column of columns) for (const option of column.options.values()) {
      const current = option.element
      if (current.disabled !== option.last.disabled) option.before.disabled = current.disabled
      if (current.defaultSelected !== option.last.defaultSelected) option.before.defaultSelected = current.defaultSelected
    }
  }
  function relevant(records: MutationRecord[]) {
    return records.filter(record => record.target === root || (root.contains(record.target)
      ? !(record.target instanceof view!.Element) || own(record.target)
      : record.type === "attributes" || [...record.removedNodes].some(node => node === root || node.contains(root))))
  }
  const observer = new view.MutationObserver(records => {
    const changes = relevant(records)
    if (!changes.length || !connected) return
    mark(changes)
    if (!root.isConnected) { disconnect(); return }
    if (resetPending) return
    try { refresh() } catch { /* refresh reports failure and maintains the native validation gate. */ }
  })
  function guard() {
    live(); if (busy) throw new Error("Cascader hooks may not reenter mutation APIs; disconnect is allowed.")
    if (resetEvents.some(event => event.eventPhase !== Event.NONE)) throw new Error("Wait until native reset dispatch finishes before changing Cascader.")
    const changes = relevant(observer.takeRecords())
    if (changes.length) { mark(changes); if (!resetPending && !refreshing) refresh() }
    if (sourceFault && !refreshing) refresh()
  }
  function abort() {
    const previous = job
    job = null
    if (previous) {
      const wasBusy = busy; busy = true
      try { previous.abort.abort() } finally { busy = wasBusy; previous.resolve(false) }
    }
  }
  function report(cause: unknown, invalid = false) {
    reports++
    error = cause
    if (invalid && connected) {
      sourceFault = true
      fault = cause instanceof Error ? cause.message : "Cascader hierarchy is invalid."
      abort(); live(); gate(); text(status, fault)
    }
    root.dispatchEvent(new view!.CustomEvent("mui:cascader-error", { detail: { error: cause } }))
  }
  function run<T>(action: () => T): T {
    guard(); observer.disconnect(); busy = true
    try { const result = action(); live(); return result }
    catch (cause) { if (connected) report(cause, true); throw cause }
    finally { busy = false; observe() }
  }
  function release(result: TreeLoadResult) {
    const wasBusy = busy; busy = true
    try {
      const value: unknown = result?.dispose?.()
      if (value && typeof (value as Promise<unknown>).then === "function") {
        void Promise.resolve(value).catch(() => {})
        throw new TypeError("Cascader batch disposal must be synchronous.")
      }
    } finally { busy = wasBusy }
  }
  function paint() {
    const labels = path.map(key => treeLabel(hierarchy.byKey.get(key)!))
    for (let level = 0; level < columns.length; level++) {
      const column = columns[level]!, parent = level ? hierarchy.byKey.get(path[level - 1] ?? "") : null
      const active = !level || !!parent?.branch
      const family = !level ? hierarchy.nodes.filter(node => !node.parent) : active ? parent!.children : []
      if (!active && column.wrapper.contains(document!.activeElement)) focus(columns.slice(0, level).reverse().find(item => item.active && available(item.control))?.control)
      live(); column.active = active
      attr(column.wrapper, "hidden", active ? base(column.wrapper, "hidden") : "")
      attr(column.control, "disabled", active ? base(column.control, "disabled") : "")
      const desired: HTMLOptionElement[] = [column.placeholder]
      for (const node of family) {
        let record = column.options.get(node.key)
        if (!record) {
          const element = document!.createElement("option"); element.value = node.key
          const before = { text: "", label: null, disabled: false, defaultSelected: false }
          record = { element, key: node.key, original: false, before, last: { ...before } }; column.options.set(node.key, record); optionIndex.set(node.key, record)
        }
        const label = treeLabel(node), disabled = unavailable(node)
        if (record.element.textContent !== label) record.element.textContent = label
        if (record.element.hasAttribute("label")) record.element.label = label
        record.element.disabled = disabled
        record.last.text = label; record.last.label = record.element.getAttribute("label"); record.last.disabled = disabled
        desired.push(record.element)
      }
      const actual = [...column.control.options]
      if (actual.some(option => ![...column.options.values()].some(record => record.element === option))) throw new Error("Do not insert unowned options; update the authored hierarchy and refresh.")
      if (actual.length !== desired.length || actual.some((option, i) => option !== desired[i])) column.control.replaceChildren(...desired)
      const defaultKey = defaults[level] ?? "", hasDefault = desired.some(option => option.value === defaultKey)
      for (const option of desired) {
        const value = hasDefault ? option.value === defaultKey : option === column.placeholder
        option.defaultSelected = value
        column.options.get(option.value)!.last.defaultSelected = value
      }
      const value = active ? path[level] ?? "" : ""
      if (column.control.value !== value) column.control.value = value
      for (const [key, option] of column.options) if (!option.original && !hierarchy.byKey.has(key)) {
        column.options.delete(key); if (optionIndex.get(key) === option) optionIndex.delete(key)
      }
    }
    const clearAvailable = (!!path.length || resetFault) && available(controls[0]!)
    if (clearButton && !clearAvailable && document!.activeElement === clearButton) focus(controls.find(available))
    live()
    if (clearButton) attr(clearButton, "hidden", clearAvailable ? null : "")
    attr(root, "aria-busy", job ? "true" : null)
    text(readout, (showPath ? labels : labels.slice(-1)).join(separator))
    const last = hierarchy.byKey.get(path.at(-1) ?? "")
    text(status, fault || (job ? "Loading choices…" : !defaultValid() ? "The default path is unavailable; update it before resetting."
      : path.length && !terminal() ? last?.branch && !last.branch.hasAttribute("data-tree-lazy") && !last.children.length
        ? "This branch has no choices. Choose another ancestor." : "Choose the next level to complete the path." : ""))
    gate()
  }
  function assertOptions() {
    for (let level = 0; level < columns.length; level++) {
      const column = columns[level]!
      for (const record of column.options.values()) if (record.element.value !== record.key) throw new Error("Projected option values are owned; edit source keys instead.")
      for (const option of column.control.options) if (![...column.options.values()].some(record => record.element === option)) throw new Error("Unowned option in Cascader control.")
    }
  }
  function refresh() {
    const previous = refreshing; refreshing = true
    try { run(() => {
      if (resetPending && resetEvents.some(event => !event.defaultPrevented)) { restoreDefaults(); return }
      if (resetPending) endReset()
      const next = validateSource(); assertOptions()
      const nextDefaults = defaultsChanged ? nativePath(true) : defaults
      const nextPath = nativePath()
      generation++; abort(); live()
      hierarchy = next; defaults = [...nextDefaults]; defaultsChanged = false
      path = prefix(nextPath); sourceFault = false
      resetFault = resetFault && !defaultValid()
      fault = resetFault ? "The original default path is no longer available. Choose a path or set a new default." : ""
      for (const batch of batches) if (batch.nodes.some(node => !source.contains(node))) {
        batches.delete(batch)
        for (const node of batch.nodes) node.remove()
        release(batch); live()
      }
      paint()
    }) } finally { refreshing = previous }
  }
  function endReset() { resetToken++; resetPending = false; resetEvents.length = 0 }
  function restoreDefaults() {
    const next = validateSource()
    generation++; abort(); live(); hierarchy = next
    if (defaultsChanged) { defaults = nativePath(true); defaultsChanged = false }
    resetFault = !defaultValid(); sourceFault = false
    path = resetFault ? [] : [...defaults]
    fault = resetFault ? "The original default path is no longer available. Choose a path or set a new default." : ""
    endReset(); paint()
    if (fault) report(new Error(fault))
  }
  function commit(keys: string[]) {
    run(() => { generation++; abort(); live(); endReset(); path = keys; fault = ""; resetFault = false; sourceFault = false; paint() })
  }
  function notify(action: "select" | "clear", event?: Event) {
    if (connected) root.dispatchEvent(new view!.CustomEvent("mui:cascader-change", { detail: { ...snapshot(), action, event } }))
  }
  function load(): Promise<boolean> {
    guard()
    const node = hierarchy.byKey.get(path.at(-1) ?? "")
    if (!node?.branch?.hasAttribute("data-tree-lazy")) return Promise.resolve(true)
    if (job) return job.promise
    if (!loader) { const cause = new Error("No Cascader loader was supplied."); report(cause); return Promise.reject(cause) }
    let resolve!: Job["resolve"], reject!: Job["reject"]
    const promise = new Promise<boolean>((yes, no) => { resolve = yes; reject = no })
    const pending: Job = { node, generation, abort: new view!.AbortController(), promise, resolve, reject }
    job = pending
    const valid = () => connected && root.isConnected && job === pending && generation === pending.generation && source.contains(node.element)
      && hierarchy.byKey.get(node.key)?.element === node.element && path.at(-1) === node.key && !pending.abort.signal.aborted
      && node.element.getAttribute("data-tree-key") === node.key && nativePath().length === path.length
      && path.every((key, level) => controls[level]!.value === key)
      && !resetEvents.some(event => !event.defaultPrevented)
    function failure(cause: unknown) {
      if (job !== pending) return
      job = null
      try { if (connected) { run(paint); report(cause) } }
      catch (cleanup) { cause = new AggregateError([cause, cleanup], "Cascader load and synchronization failed.") }
      finally { reject(cause) }
    }
    try {
      run(paint)
      let result: TreeLoadResult | Promise<TreeLoadResult>
      busy = true
      try { result = loader(node, { signal: pending.abort.signal }) } finally { busy = false }
      Promise.resolve(result).then(value => {
        if (!valid()) {
          if (job === pending) {
            abort()
            if (connected) {
              if (!root.isConnected) disconnect()
              else if (!resetPending) { try { refresh() } catch { /* The failed source is already gated and reported. */ } }
            }
          }
          try { release(value) } catch (cause) { report(cause) }
          return
        }
        const insertion: { batch: TreeLoadResult | null } = { batch: null }
        try {
          if (!value || !Array.isArray(value.nodes) || value.nodes.length > 200 || value.dispose !== undefined && typeof value.dispose !== "function") throw new TypeError("Load returns {nodes: native li[], dispose?}, at most 200 roots.")
          const batch: TreeLoadResult = { nodes: Object.freeze([...value.nodes]), ...(value.dispose ? { dispose: value.dispose } : {}) }
          const seen = new Set<Element>(), ids = new Set<string>()
          for (const li of batch.nodes) {
            if (!(li instanceof view!.HTMLLIElement) || li.parentNode || li.ownerDocument !== document || li.isConnected || (li as Owned)[treeOwner]) throw new TypeError("Return fresh, parentless, unowned native source rows.")
            for (const element of [li, ...li.querySelectorAll("*")]) {
              if (seen.has(element) || seen.size >= 4000 || element.localName.includes("-")
                || (element as Owned)[owner] || (element as Owned)[treeOwner]
                || element.matches("input,select,textarea,button,script,style,link,iframe,object,embed,[is],[data-tree-select],[data-tree]")) throw new TypeError("Lazy source results must contain at most 4000 unowned passive native elements.")
              seen.add(element)
              if (element.id) { if (ids.has(element.id) || document!.getElementById(element.id)) throw new TypeError("Source IDs must be unique."); ids.add(element.id) }
            }
          }
          const next = validateSource({ list: node.list!, nodes: batch.nodes })
          assertOptions()
          if (next.nodes.length - hierarchy.nodes.length > 200) throw new RangeError("A load may add at most 200 hierarchy nodes.")
          run(() => {
            if (!valid()) throw new Error("Cascader load was superseded.")
            node.list!.append(...batch.nodes); insertion.batch = batch; batches.add(batch)
            attr(node.branch!, "data-tree-lazy", null); hierarchy = next; job = null; paint()
          })
          resolve(true)
          if (connected) root.dispatchEvent(new view!.CustomEvent("mui:cascader-load", { detail: { ...snapshot(), node, nodes: batch.nodes } }))
        } catch (cause) {
          const inserted = insertion.batch
          if (inserted) {
            if (batches.delete(inserted)) {
              for (const element of inserted.nodes) element.remove()
              if (connected) attr(node.branch!, "data-tree-lazy", "")
              try { release(inserted) } catch (cleanup) { cause = new AggregateError([cause, cleanup]) }
            }
            reject(cause)
          }
          if (!inserted) { try { release(value) } catch (cleanup) { cause = new AggregateError([cause, cleanup]) } }
          failure(cause)
        }
      }, failure).catch(failure)
    } catch (cause) { failure(cause) }
    return promise
  }
  function change(event: Event) {
    if (resetPending) return
    const level = controls.indexOf(event.target as HTMLSelectElement)
    if (level < 0) return
    const previousReports = reports
    try {
      guard()
      const value = controls[level]!.value
      if (value === (path[level] ?? "")) return
      const keys = validatePath([...path.slice(0, level), ...value ? [value] : []])
      commit(keys)
      void load().catch(() => {})
      notify("select", event)
    } catch (cause) { if (connected && reports === previousReports) report(cause, true) }
  }
  function clear(event?: Event) {
    guard()
    if (!path.length && !resetFault || !available(controls[0]!)) return false
    commit([]); notify("clear", event); return true
  }
  function click(event: MouseEvent) {
    if (clearButton?.contains(event.target as Node) && !event.defaultPrevented) {
      const current = generation, timer = view!.setTimeout(() => {
        timers.delete(timer)
        if (connected && current === generation && !event.defaultPrevented) {
          try { clear(event) } catch { /* Direct operations report runtime errors. */ }
        }
      }, 0)
      timers.add(timer)
    }
  }
  function reset(event: Event) {
    if (event.target !== form || !connected) return
    resetEvents.push(event)
    if (resetPending) return
    const current = generation, token = ++resetToken
    resetPending = true
    gate()
    const timer = view!.setTimeout(() => {
      timers.delete(timer)
      if (!connected || token !== resetToken || generation !== current) return
      const restore = resetEvents.some(event => !event.defaultPrevented)
      try {
        run(() => {
          if (restore) restoreDefaults()
          else { endReset(); gate() }
        })
      } catch { /* Reported by run. */ }
    }, 0)
    timers.add(timer)
  }
  function submit(event: Event) {
    if (event.target !== form || !connected) return
    try { if (!resetPending) refresh() } catch { /* Fault gate below prevents a success-shaped submission. */ }
    if (controls.some(control => !control.matches(":disabled")) && (fault || !snapshot().valid)) event.preventDefault()
  }
  function disconnect() {
    if (!connected) return
    const active = document!.activeElement
    const retiring = [...batches].flatMap(batch => [...batch.nodes])
    let destination: HTMLElement | undefined
    if (active && retiring.some(node => node.contains(active))) {
      for (let element = active.parentElement; element && element !== root; element = element.parentElement) {
        const summary = element.localName === "details" ? element.firstElementChild as HTMLElement | null : null
        if (summary && !retiring.some(node => node.contains(summary)) && available(summary)) { destination = summary; break }
      }
      destination ??= controls.find(available)
    }
    connected = false; generation++; endReset(); observer.disconnect(); abort()
    if (destination && document!.activeElement === active) destination.focus({ preventScroll: true })
    for (const timer of timers) view!.clearTimeout(timer); timers.clear()
    root.removeEventListener("change", change); root.removeEventListener("click", click)
    document!.removeEventListener("reset", reset, true); document!.removeEventListener("submit", submit, true)
    const errors: unknown[] = []
    for (const batch of batches) {
      for (const node of batch.nodes) node.remove()
      try { release(batch) } catch (cause) { errors.push(cause) }
    }
    batches.clear()
    for (const column of columns) {
      for (const record of column.options.values()) if (record.original) {
        if (record.element.textContent === record.last.text) record.element.textContent = record.before.text
        if (record.element.getAttribute("label") === record.last.label) {
          if (record.before.label === null) record.element.removeAttribute("label")
          else record.element.setAttribute("label", record.before.label)
        }
        if (record.element.disabled === record.last.disabled) record.element.disabled = record.before.disabled
        if (record.element.defaultSelected === record.last.defaultSelected) record.element.defaultSelected = record.before.defaultSelected
      }
      column.control.replaceChildren(...column.original)
      column.control.selectedIndex = column.selected ? [...column.control.options].indexOf(column.selected) : -1
      column.options.clear()
    }
    for (const lease of attributes) if (lease.element.getAttribute(lease.name) === lease.last) {
      if (lease.before === null) lease.element.removeAttribute(lease.name)
      else lease.element.setAttribute(lease.name, lease.before)
    }
    for (const lease of texts) if (lease.element.textContent === lease.last) lease.element.textContent = lease.before
    for (const lease of gates) if (currentMessage(lease.control) === lease.last) lease.control.setCustomValidity(lease.before)
    for (const element of borrowed) {
      if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
      if ((element as Owned)[selectOwner] === token) delete (element as Owned)[selectOwner]
      if ((element as Owned)[treeOwner] === token) delete (element as Owned)[treeOwner]
    }
    if (clearButton && clearButton === active && !available(clearButton)) controls.find(available)?.focus({ preventScroll: true })
    path = []; defaults = []; hierarchy = { nodes: [], byKey: new Map() }; optionIndex.clear(); borrowed.clear(); attributes.length = 0; texts.length = 0; gates.length = 0; resetEvents.length = 0
    if (errors.length) { const cause = new AggregateError(errors, "Cascader cleanup failed."); report(cause); throw cause }
  }
  const controller: CascaderController = {
    get connected() { return connected }, get error() { return error }, get state() { return snapshot() }, controls,
    setValue(value) { guard(); commit(valuePath(value)) },
    setPath(keys) { guard(); commit(validatePath(keys)) },
    setDefaultValue(value) { guard(); const keys = valuePath(value); run(() => { defaults = keys; defaultsChanged = false; fault = ""; resetFault = false; sourceFault = false; paint() }) },
    clear: () => clear(), load, refresh, disconnect,
  }
  try {
    hierarchy = validateSource()
    for (let level = 0; level < columns.length; level++) for (const record of columns[level]!.options.values()) if (record.key) {
      let node = hierarchy.byKey.get(record.key), depth = 0
      if (!node) throw new TypeError("Authored option keys must exist in the source hierarchy.")
      while (node) { depth++; node = node.parent ?? undefined }
      if (depth !== level + 1) throw new TypeError("Authored options must match their hierarchy level.")
    }
    defaults = options.defaultValue === undefined ? validatePath(nativePath(true)) : valuePath(options.defaultValue)
    path = options.value === undefined ? options.defaultValue === undefined ? validatePath(nativePath()) : [...defaults] : valuePath(options.value)
    const owned = new Set<HTMLElement>([root, source, ...controls, ...wrappers, ...[readout, status, clearButton].filter((node): node is HTMLElement => !!node)])
    for (const element of owned) if ((element as Owned)[owner]
      || controls.includes(element as HTMLSelectElement) && (element as Owned)[selectOwner]
      || element === source && (element as Owned)[treeOwner]) throw new Error("Cascader source/select already has an owner.")
    for (const element of owned) { (element as Owned)[owner] = token; borrowed.add(element) }
    ;(source as Owned)[treeOwner] = token
    for (const control of controls) (control as Owned)[selectOwner] = token
    run(paint)
    root.addEventListener("change", change); root.addEventListener("click", click)
    document.addEventListener("reset", reset, true); document.addEventListener("submit", submit, true)
    observe()
  } catch (cause) { disconnect(); throw cause }
  return controller
}
