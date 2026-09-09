export type TransferSide = "source" | "target"
export interface TransferOptions {
  value?: readonly string[] | null
  defaultValue?: readonly string[] | null
  name?: string
  required?: boolean
}
export interface TransferState {
  readonly value: readonly string[]
  readonly source: readonly string[]
  readonly stagedSource: readonly string[]
  readonly stagedTarget: readonly string[]
  readonly sourceMatches: number
  readonly targetMatches: number
  readonly defaultValue: readonly string[]
  readonly missingDefaults: readonly string[]
  readonly disabled: boolean
  readonly pending: boolean
  readonly valid: boolean
}
export interface TransferController {
  readonly source: HTMLSelectElement
  readonly target: HTMLSelectElement
  readonly connected: boolean
  readonly error: unknown
  readonly value: readonly string[]
  readonly state: TransferState
  setValue(keys: readonly string[] | null): void
  setDefaultValue(keys: readonly string[] | null): void
  move(keys: readonly string[], to: TransferSide): number
  moveSelected(to: TransferSide): number
  moveAll(to: TransferSide): number
  selectAll(side: TransferSide): void
  clearSelection(side: TransferSide): void
  setFilter(side: TransferSide, value: string): void
  appendTo(data: FormData, name?: string): number
  refresh(): void
  disconnect(): void
}
interface Item { key: string; element: HTMLOptionElement; hiddenBefore: boolean; hiddenLast: boolean }
interface Action { element: HTMLButtonElement; name: string; hidden: string | null; suppressed: boolean; lastHidden: boolean; disabled: boolean; lastDisabled: boolean }
interface Text { element: HTMLElement; before: string; last: string }
const owner = Symbol.for("markup-ui.transfer.owner"), selectOwner = Symbol.for("markup-ui.select.owner")
const names = Symbol.for("markup-ui.transfer.form-names")
type Owned = Element & { [owner]?: object; [selectOwner]?: object }
type NamedForm = HTMLFormElement & { [names]?: Map<string, object> }
const actions = ["add", "remove", "add-all", "remove-all", "select-source", "select-target", "clear-source", "clear-target"]

/** Moves original native options. Target membership and native staging are distinct. */
export function createTransfer(root: HTMLElement, options: TransferOptions = {}): TransferController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches(".mui-transfer[data-transfer]")
    || !["div", "section", "fieldset"].includes(root.localName) || (root as Owned)[owner]) throw new TypeError("Transfer needs an unowned native .mui-transfer[data-transfer] root.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["value", "defaultValue", "name", "required"].includes(key))
    || options.name !== undefined && typeof options.name !== "string"
    || options.required !== undefined && typeof options.required !== "boolean") throw new TypeError("Unsupported Transfer options.")
  const fieldName = options.name === undefined ? root.getAttribute("data-transfer-name") : options.name
  const requiredOption = options.required
  const required = () => requiredOption ?? root.hasAttribute("data-transfer-required")
  if (fieldName !== null && (typeof fieldName !== "string" || !fieldName || fieldName.length > 128)) throw new TypeError("Use a nonempty membership field name of at most 128 characters.")
  const own = (node: Element) => node.closest("[data-transfer]") === root
  function all(selector: string) { return [...root.querySelectorAll<HTMLElement>(selector)].filter(own) }
  function one(selector: string, required = false) {
    const nodes = all(selector)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const sourceNode = one("[data-transfer-source]", true), targetNode = one("[data-transfer-target]", true)
  if (!(sourceNode instanceof view.HTMLSelectElement) || !(targetNode instanceof view.HTMLSelectElement) || sourceNode === targetNode) throw new TypeError("Use two distinct native selects.")
  const source = sourceNode, target = targetNode, form = source.form as NamedForm | null
  if (fieldName && form && typeof view.FormDataEvent !== "function") throw new TypeError("Native formdata events are unavailable; omit name and call appendTo explicitly.")
  const filters = { source: one('[data-transfer-filter="source"]'), target: one('[data-transfer-filter="target"]') }
  for (const node of Object.values(filters)) if (node && (!(node instanceof view.HTMLInputElement) || !["text", "search"].includes(node.type)
    || ![...node.labels ?? []].some(label => label.textContent?.trim()) || node.hasAttribute("role"))) throw new TypeError("Filters need labelled native text/search inputs.")
  const sourceFilter = filters.source as HTMLInputElement | null, targetFilter = filters.target as HTMLInputElement | null
  const counts = { source: one('[data-transfer-count="source"]'), target: one('[data-transfer-count="target"]') }
  const status = one("[data-transfer-status]")
  const texts: Text[] = []
  for (const node of [counts.source, counts.target, status]) if (node && (node.childElementCount || node.closest("label,button,summary"))) throw new TypeError("Counts/status must be separate plain text.")
  const buttons: Action[] = all("[data-transfer-action]").map(node => {
    const name = node.getAttribute("data-transfer-action")!
    if (!(node instanceof view.HTMLButtonElement) || node.type !== "button" || !actions.includes(name)
      || !node.textContent?.trim() || node.closest("label,summary") || node.hasAttribute("role")
      || node.hasAttribute("popovertarget") || node.hasAttribute("commandfor")
      || node.querySelector("input,select,textarea,button,a,[tabindex]")) throw new TypeError("Transfer actions must be separate labelled type=button controls.")
    return { element: node, name, hidden: node.getAttribute("hidden"), suppressed: false, lastHidden: false, disabled: node.disabled, lastDisabled: node.disabled }
  })
  if (new Set(buttons.map(button => button.name)).size !== buttons.length || !["add", "remove"].every(name => buttons.some(button => button.name === name))) throw new TypeError("Author one add and remove action, and no duplicate actions.")
  const token = {}, borrowed = new Set<HTMLElement>()
  let items = new Map<string, Item>(), defaults: string[] = [], connected = true, busy = false, generation = 0, refreshing = false
  let error: unknown = null, fault = false, pendingReset = false, resetToken = 0, initialized = false
  const resetEvents: Event[] = [], timers = new Set<number>(), composing = new Set<HTMLInputElement>()
  const gateBefore = new Map<HTMLSelectElement, string>(), gateLast = new Map<HTMLSelectElement, string>()
  function live() { if (!connected) throw new Error("Transfer is disconnected; membership remains in the native target list.") }
  function pane(side: TransferSide) { if (side !== "source" && side !== "target") throw new TypeError("Side must be source or target."); return side === "source" ? source : target }
  function list(control: HTMLSelectElement) { return [...control.options] }
  function keys(control: HTMLSelectElement) { return list(control).map(option => option.value) }
  function staged(control: HTMLSelectElement) { return list(control).filter(option => option.selected).map(option => option.value) }
  function disabled() { return source.matches(":disabled") || target.matches(":disabled") }
  function eligible(control: HTMLSelectElement, selected = false) {
    return list(control).filter(option => !option.disabled && !option.hidden && (!selected || option.selected))
  }
  function formName(name = fieldName) {
    if (name && form && [...form.elements].some(element => element.getAttribute("name") === name)) throw new Error("Membership name conflicts with a native form control; staging lists must remain unnamed.")
    if (name && form?.[names]?.get(name) && form[names]!.get(name) !== token) throw new Error("Membership name already has another Transfer owner.")
  }
  function collect() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-transfer[data-transfer]") || root.hasAttribute("role")
      || one("[data-transfer-source]", true) !== source || one("[data-transfer-target]", true) !== target
      || [source, target].some(control => !root.contains(control) || !own(control) || !control.multiple || control.name
        || control.required || control.hasAttribute("role") || control.hasAttribute("readonly") || control.hasAttribute("is") || control.form !== form
        || ![...control.labels ?? []].some(label => label.textContent?.trim()))
      || [...Object.values(filters), ...Object.values(counts), status, ...buttons.map(button => button.element)]
        .some(node => node && (!root.contains(node) || !own(node)))
      || one('[data-transfer-filter="source"]') !== sourceFilter || one('[data-transfer-filter="target"]') !== targetFilter
      || all("[data-transfer-action]").length !== buttons.length
      || buttons.some(action => action.element.type !== "button" || action.element.getAttribute("data-transfer-action") !== action.name)
      || [counts.source, counts.target, status].some(node => node && (node.childElementCount || node.closest("label,button,summary")))) throw new TypeError("Keep two labelled, unnamed, non-required native multi-selects and the original action/filter anatomy. Required means membership, not staging.")
    if (options.name === undefined && root.getAttribute("data-transfer-name") !== fieldName) throw new Error("Rebind Transfer to change the membership field name.")
    formName()
    const next = new Map<string, Item>()
    for (const control of [source, target]) {
      if ([...control.children].some(node => !(node instanceof view!.HTMLOptionElement))) throw new TypeError("Use direct native option nodes, not optgroups or renderers.")
      for (const element of list(control)) {
        if (next.size >= 2000 || !element.hasAttribute("value") || !element.value || element.value.length > 256
          || !element.label.trim() || element.label.length > 1024 || element.childElementCount || element.hasAttribute("is") || next.has(element.value)) throw new TypeError("Use at most 2000 plain options with unique nonempty string values and bounded labels.")
        if ((element as Owned)[owner] && (element as Owned)[owner] !== token) throw new Error("Transfer option already has an owner.")
        const prior = items.get(element.value)
        next.set(element.value, prior?.element === element ? prior : { key: element.value, element, hiddenBefore: element.hidden, hiddenLast: element.hidden })
      }
    }
    return next
  }
  function restoreItem(item: Item) {
    if (item.element.hidden === item.hiddenLast) item.element.hidden = item.hiddenBefore
    if ((item.element as Owned)[owner] === token) delete (item.element as Owned)[owner]
  }
  function sync(next: Map<string, Item>) {
    for (const [key, item] of items) if (next.get(key)?.element !== item.element) restoreItem(item)
    for (const item of next.values()) (item.element as Owned)[owner] = token
    items = next
  }
  function validate(input: readonly string[] | null) {
    const value = input === null ? [] : input
    if (!Array.isArray(value) || value.some(key => typeof key !== "string" || !items.has(key)) || new Set(value).size !== value.length) throw new TypeError("Use unique known native string keys, or null for empty membership.")
    return [...value]
  }
  function locks(value: readonly string[]) {
    const wanted = new Set(value)
    for (const item of items.values()) if (item.element.disabled && wanted.has(item.key) !== (item.element.parentElement === target)) throw new Error("A locked option cannot change membership.")
  }
  function available(node: HTMLElement) {
    if (!node.isConnected || node.matches(":disabled") || node.closest("[hidden],[inert]")) return false
    for (let current: HTMLElement | null = node; current; current = current.parentElement) {
      const style = view!.getComputedStyle(current)
      if (style.display === "none" || style.visibility === "hidden") return false
      if (current.localName === "details" && !(current as HTMLDetailsElement).open && !current.firstElementChild?.contains(node)) return false
    }
    return true
  }
  function focus(node: HTMLElement) { if (available(node)) { node.focus({ preventScroll: true }); live() } }
  function writeText(node: HTMLElement | null, value: string) {
    if (!node || !root.contains(node) || !own(node) || node.childElementCount) return
    let record = texts.find(record => record.element === node)
    if (!record) { record = { element: node, before: node.textContent ?? "", last: node.textContent ?? "" }; texts.push(record) }
    if (node.textContent !== record.last) record.before = node.textContent ?? ""
    if (node.textContent !== value) node.textContent = value
    record.last = value
  }
  function gate() {
    const control = source.willValidate ? source : target
    const message = fault ? "Transfer data or membership field ownership is invalid." : pendingReset ? "Restoring Transfer membership…" : required() && !target.options.length ? "Choose at least one target member." : ""
    for (const field of [source, target]) {
      const current = field.validity.customError ? field.validationMessage : ""
      if (!gateBefore.has(field) || current !== gateLast.get(field)) gateBefore.set(field, current)
      const value = gateBefore.get(field)! || (field === control ? message : "")
      if (current !== value) field.setCustomValidity(value)
      gateLast.set(field, value)
    }
  }
  function paint() {
    for (const [side, filter] of [["source", sourceFilter], ["target", targetFilter]] as const) {
      const pattern = filter?.value.trim().toLocaleLowerCase() ?? ""
      if (!filter || !composing.has(filter)) for (const element of list(pane(side))) {
        const item = items.get(element.value)!
        if (element.hidden !== item.hiddenLast) item.hiddenBefore = element.hidden
        element.hidden = item.hiddenBefore || !!pattern && !element.label.toLocaleLowerCase().includes(pattern)
        item.hiddenLast = element.hidden
      }
    }
    for (const action of buttons) {
      if (action.element.disabled !== action.lastDisabled) action.disabled = action.element.disabled
      const side = action.name.endsWith("source") || action.name.startsWith("add") ? source : target
      const count = action.name === "add" || action.name === "remove" ? eligible(side, true).length
        : action.name.startsWith("clear-") ? staged(side).length : eligible(side).length
      const next = action.disabled || disabled() || !count || fault || pendingReset
      if (next && document!.activeElement === action.element && available(side)) focus(side)
      live(); action.element.hidden = action.suppressed; action.lastHidden = action.suppressed; action.element.disabled = next; action.lastDisabled = next
    }
    writeText(counts.source, `${source.options.length} available; ${staged(source).length} highlighted; ${eligible(source, true).length} movable matches`)
    writeText(counts.target, `${target.options.length} members; ${staged(target).length} highlighted; ${eligible(target, true).length} movable matches`)
    writeText(status, fault ? "Transfer cannot use the current data or field name." : defaults.some(key => !items.has(key)) ? "Some default member keys are no longer available." : "")
    gate()
  }
  function state(): TransferState {
    live()
    return Object.freeze({
      value: Object.freeze(keys(target)), source: Object.freeze(keys(source)), stagedSource: Object.freeze(staged(source)), stagedTarget: Object.freeze(staged(target)),
      sourceMatches: eligible(source).length, targetMatches: eligible(target).length,
      defaultValue: Object.freeze([...defaults]), missingDefaults: Object.freeze(defaults.filter(key => !items.has(key))),
      disabled: disabled(), pending: pendingReset,
      valid: disabled() || !fault && !pendingReset && (!required() || !!target.options.length) && [source, target].every(control => !control.willValidate || control.validity.valid),
    })
  }
  function relevant(changes: MutationRecord[]) {
    return changes.filter(change => change.target === root || root.contains(change.target) && (!(change.target instanceof view!.Element) || own(change.target))
      || change.type === "attributes" && ["name", "form"].includes(change.attributeName ?? "")
      || change.type === "attributes" && change.target instanceof view!.Element && change.target.contains(root)
      || [...change.removedNodes].some(node => node === root || node.contains(root))
      || [...change.addedNodes].some(node => node instanceof view!.Element && (node.hasAttribute("name") || node.querySelector("[name]"))))
  }
  function mark(changes: MutationRecord[]) {
    for (const change of changes) {
      if (change.attributeName === "hidden") {
        const item = [...items.values()].find(item => item.element === change.target)
        if (item) item.hiddenBefore = item.hiddenLast = item.element.hidden
      }
      const action = buttons.find(action => action.element === change.target)
      if (action && change.attributeName === "disabled") action.disabled = action.lastDisabled = action.element.disabled
      if (action && change.attributeName === "hidden") { action.hidden = action.element.getAttribute("hidden"); action.suppressed = action.lastHidden = action.element.hidden }
    }
  }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["data-transfer", "data-transfer-source", "data-transfer-target", "data-transfer-name", "data-transfer-required", "data-transfer-action", "data-transfer-filter", "type", "value", "label", "disabled", "hidden", "name", "form", "required", "multiple", "role"] })
    if (form) observer.observe(form, { subtree: true, childList: true, attributes: true, attributeFilter: ["name", "form"] })
    for (let parent = root.parentElement; parent; parent = parent.parentElement) if (parent !== form) observer.observe(parent, { childList: true, attributes: true, attributeFilter: ["disabled","hidden","inert"] })
  }
  const observer = new view.MutationObserver(changes => {
    const pending = relevant(changes); if (!pending.length || !connected) return
    mark(pending)
    if (!root.isConnected) { disconnect(); return }
    if (!pendingReset) { try { refresh() } catch { /* Native gate/error event remains active. */ } }
  })
  function report(cause: unknown) {
    error = cause; fault = true
    if (connected) { gate(); writeText(status, cause instanceof Error ? cause.message : "Transfer failed.") }
    root.dispatchEvent(new view!.CustomEvent("mui:transfer-error", { detail: { error: cause } }))
  }
  function guard() {
    live(); if (busy || resetEvents.some(event => event.eventPhase !== Event.NONE)) throw new Error("Transfer mutation cannot reenter an active operation/reset dispatch.")
    const pending = relevant(observer.takeRecords())
    if (pending.length) { mark(pending); if (!refreshing && !pendingReset) refresh() }
    if (pendingReset && !refreshing) refresh()
    if (fault && !refreshing) refresh()
  }
  function run(action: () => void) {
    guard(); observer.disconnect(); busy = true
    try { action(); live() } catch (cause) { if (connected) report(cause); throw cause }
    finally { busy = false; observe() }
  }
  function endReset() { pendingReset = false; resetToken++; resetEvents.length = 0 }
  function arrange(value: readonly string[]) {
    if (value.length === target.options.length && value.every((key, index) => target.options[index]!.value === key)) return
    const wanted = new Set(value), flags = new Map([...items.values()].map(item => [item.element, item.element.selected]))
    for (const option of list(target)) if (!wanted.has(option.value)) source.append(option)
    for (const key of value) {
      const option = items.get(key)!.element
      if (option.parentElement !== target || option !== target.lastElementChild) target.append(option)
    }
    for (const [option, selected] of flags) option.selected = selected
  }
  function restoreDefaults() {
    sync(collect())
    composing.clear()
    const wanted = defaults.filter(key => {
      const item = items.get(key); return item && (!item.element.disabled || item.element.parentElement === target)
    })
    for (const element of list(target)) if (element.disabled && !wanted.includes(element.value)) wanted.push(element.value)
    arrange(wanted)
    for (const item of items.values()) item.element.selected = item.element.defaultSelected
    generation++; endReset(); fault = false; paint()
  }
  function refresh() {
    const previous = refreshing; refreshing = true
    try { run(() => {
      if (pendingReset && resetEvents.some(event => !event.defaultPrevented)) { restoreDefaults(); return }
      if (pendingReset) endReset()
      sync(collect()); fault = false; generation++; paint()
    }) } finally { refreshing = previous }
  }
  function setValue(input: readonly string[] | null) {
    guard(); const value = validate(input); locks(value)
    run(() => { generation++; endReset(); arrange(value); paint() })
  }
  function perform(input: readonly string[], to: TransferSide, user = false, event?: Event) {
    guard(); const destination = pane(to), origin = to === "target" ? source : target, value = validate(input)
    if (value.some(key => items.get(key)!.element.parentElement !== origin || items.get(key)!.element.disabled)) throw new Error("Move only unlocked keys currently in the opposite pane.")
    const selected = new Set(value), moving = list(origin).filter(option => selected.has(option.value))
    if (!moving.length || user && disabled()) return 0
    run(() => {
      generation++; endReset()
      const flags = moving.map(option => option.selected)
      destination.append(...moving)
      moving.forEach((option, index) => { option.selected = flags[index]! })
      if (user) focus(destination)
      paint()
    })
    if (user && connected) root.dispatchEvent(new view!.CustomEvent("mui:transfer-change", { detail: { value: Object.freeze(keys(target)), moved: Object.freeze(moving.map(option => option.value)), to, event } }))
    return moving.length
  }
  function matching(to: TransferSide, selected: boolean, user = false, event?: Event) {
    guard(); const origin = pane(to === "target" ? "source" : "target")
    return perform(eligible(origin, selected).map(option => option.value), to, user, event)
  }
  function selectAll(side: TransferSide) { guard(); const control = pane(side); run(() => { generation++; eligible(control).forEach(option => { option.selected = true }); paint() }) }
  function clearSelection(side: TransferSide) { guard(); const control = pane(side); run(() => { generation++; list(control).forEach(option => { option.selected = false }); paint() }) }
  function click(event: MouseEvent) {
    const action = buttons.find(action => action.element.contains(event.target as Node))
    if (!action) return
    const current = generation, reset = resetToken
    view!.queueMicrotask(() => {
      if (!connected || current !== generation || reset !== resetToken || event.defaultPrevented || !available(action.element)) return
      try {
        if (action.name === "add" || action.name === "remove") matching(action.name === "add" ? "target" : "source", true, true, event)
        else if (action.name === "add-all" || action.name === "remove-all") matching(action.name === "add-all" ? "target" : "source", false, true, event)
        else if (action.name.startsWith("select-")) selectAll(action.name.endsWith("source") ? "source" : "target")
        else clearSelection(action.name.endsWith("source") ? "source" : "target")
      } catch (cause) { if (connected && error !== cause) report(cause) }
    })
  }
  function change(event: Event) {
    if (event.target !== source && event.target !== target) return
    try { refresh(); root.dispatchEvent(new view!.CustomEvent("mui:transfer-stage", { detail: { side: event.target === source ? "source" : "target", selected: Object.freeze(staged(event.target as HTMLSelectElement)), event } })) } catch { /* Reported. */ }
  }
  function filterInput(event: Event) {
    if (event.target !== sourceFilter && event.target !== targetFilter) return
    if (event.type === "compositionstart") { composing.add(event.target as HTMLInputElement); return }
    if (event.type === "compositionend") composing.delete(event.target as HTMLInputElement)
    if (composing.has(event.target as HTMLInputElement) || event instanceof view!.InputEvent && event.isComposing) return
    try { refresh() } catch { /* Reported. */ }
  }
  function reset(event: Event) {
    if (event.target !== form || !connected) return
    resetEvents.push(event); if (pendingReset) return
    pendingReset = true; gate()
    const token = ++resetToken, current = generation, id = view!.setTimeout(() => {
      timers.delete(id)
      if (!connected || token !== resetToken || current !== generation) return
      try { refresh() } catch { /* Reported. */ }
    }, 0); timers.add(id)
  }
  function appendTo(data: FormData, name = fieldName ?? "") {
    guard(); if (pendingReset) refresh()
    if (!(data instanceof view!.FormData) || typeof name !== "string" || !name || name.length > 128) throw new TypeError("appendTo needs native FormData and an explicit bounded field name.")
    formName(name)
    if (data.has(name)) throw new Error("Membership field already exists in FormData; no value was overwritten.")
    if (disabled()) return 0
    if (!state().valid) throw new Error("Transfer membership is not valid for submission.")
    const value = keys(target); for (const key of value) data.append(name, key)
    return value.length
  }
  function formdata(event: Event) {
    if (!connected || !fieldName || event.target !== form) return
    try { appendTo((event as FormDataEvent).formData) } catch (cause) { report(cause) }
  }
  function submit(event: Event) {
    if (!connected || event.target !== form) return
    try { refresh() } catch { /* Fault remains gated. */ }
    if (!disabled() && !state().valid) event.preventDefault()
  }
  function disconnect() {
    if (!connected) return
    if (initialized && root.isConnected && !busy) { try { refresh() } catch { /* Preserve current author DOM; last failure remains observable. */ } }
    connected = false; generation++; endReset(); observer.disconnect()
    timers.forEach(id => view!.clearTimeout(id)); timers.clear()
    root.removeEventListener("click", click); root.removeEventListener("change", change); root.removeEventListener("input", filterInput)
    root.removeEventListener("compositionstart", filterInput); root.removeEventListener("compositionend", filterInput)
    document!.removeEventListener("reset", reset, true); document!.removeEventListener("submit", submit, true); form?.removeEventListener("formdata", formdata)
    for (const item of items.values()) restoreItem(item)
    for (const action of buttons) {
      if (action.element.disabled === action.lastDisabled) action.element.disabled = action.disabled
      if (action.element.hidden === action.lastHidden) {
        if (document!.activeElement === action.element) [target, source].find(available)?.focus({ preventScroll: true })
        if (action.hidden === null) action.element.removeAttribute("hidden"); else action.element.setAttribute("hidden", action.hidden)
      }
    }
    for (const record of texts) if (!record.element.childElementCount && record.element.textContent === record.last) {
      record.element.textContent = record.element === counts.source ? `${source.options.length} available`
        : record.element === counts.target ? `${target.options.length} members` : record.before
    }
    for (const control of [source, target]) if ((control.validity.customError ? control.validationMessage : "") === gateLast.get(control)) control.setCustomValidity(gateBefore.get(control) ?? "")
    for (const node of borrowed) {
      if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
      if ((node as Owned)[selectOwner] === token) delete (node as Owned)[selectOwner]
    }
    if (fieldName && form?.[names]?.get(fieldName) === token) { form[names]!.delete(fieldName); if (!form[names]!.size) delete form[names] }
    items.clear(); borrowed.clear(); texts.length = 0; defaults = []
  }
  const controller: TransferController = {
    source, target, get connected() { return connected }, get error() { return error }, get value() { live(); return Object.freeze(keys(target)) }, get state() { return state() },
    setValue, setDefaultValue(input) { guard(); const value = validate(input); run(() => { defaults = value; paint() }) },
    move: (input, to) => perform(input, to), moveSelected: to => matching(to, true), moveAll: to => matching(to, false),
    selectAll, clearSelection, setFilter(side, value) {
      guard(); pane(side); const filter = side === "source" ? sourceFilter : targetFilter
      if (!filter || typeof value !== "string") throw new TypeError("Use an authored filter and a literal string.")
      if (composing.has(filter)) throw new Error("Do not replace a composing filter draft.")
      run(() => { generation++; filter.value = value; paint() })
    }, appendTo, refresh, disconnect,
  }
  try {
    items = collect()
    defaults = options.defaultValue === undefined ? keys(target) : validate(options.defaultValue)
    const value = options.value === undefined ? options.defaultValue === undefined ? keys(target) : defaults : validate(options.value)
    locks(value)
    for (const node of [root, source, target, ...Object.values(filters), ...Object.values(counts), status, ...buttons.map(action => action.element)]) if (node) {
      if ((node as Owned)[owner] || (node === source || node === target) && (node as Owned)[selectOwner]) throw new Error("Transfer control/view already has an owner.")
    }
    for (const node of [root, source, target, ...Object.values(filters), ...Object.values(counts), status, ...buttons.map(action => action.element)]) if (node) { (node as Owned)[owner] = token; borrowed.add(node) }
    ;(source as Owned)[selectOwner] = token; (target as Owned)[selectOwner] = token
    if (fieldName && form) { form[names] ??= new Map(); form[names]!.set(fieldName, token) }
    run(() => { sync(items); arrange(value); paint() })
    initialized = true
    root.addEventListener("click", click); root.addEventListener("change", change); root.addEventListener("input", filterInput)
    root.addEventListener("compositionstart", filterInput); root.addEventListener("compositionend", filterInput)
    document.addEventListener("reset", reset, true); document.addEventListener("submit", submit, true); if (fieldName) form?.addEventListener("formdata", formdata)
    observe()
  } catch (cause) {
    if (!borrowed.size) { connected = false; throw cause }
    disconnect(); throw cause
  }
  return controller
}
