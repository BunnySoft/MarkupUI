import { createSelect } from "../select/select.js"
import type { SelectController } from "../select/select.js"
import { readTreeHierarchy, treeLabel } from "../tree/hierarchy.js"
import type { TreeNode } from "../tree/hierarchy.js"

export type TreeSelectValue = string | null | readonly string[]
export interface TreeSelectOptions {
  selection?: "leaf" | "any"
  value?: TreeSelectValue
  defaultValue?: TreeSelectValue
  showPath?: boolean
  separator?: string
}
export interface TreeSelectState {
  readonly value: TreeSelectValue
  readonly keys: readonly string[]
  readonly paths: readonly (readonly string[])[]
  readonly defaultKeys: readonly string[]
  readonly unavailableDefaultKeys: readonly string[]
  readonly valid: boolean
}
export interface TreeSelectController {
  readonly control: HTMLSelectElement
  readonly filter: HTMLInputElement | null
  readonly connected: boolean
  readonly error: unknown
  readonly value: TreeSelectValue
  readonly state: TreeSelectState
  setValue(value: TreeSelectValue): void
  setDefaultValue(value: TreeSelectValue): void
  setFilter(value: string): void
  clear(): boolean
  refresh(): void
  disconnect(): void
}
interface Projection { node: TreeNode; label: string; disabled: boolean }
interface Option { element: HTMLOptionElement; disabled: boolean; lastDisabled: boolean }
interface Text { node: HTMLElement; before: string; last: string }
const owner = Symbol.for("markup-ui.tree-select.owner")
const treeOwner = Symbol.for("markup-ui.tree.owner")
type Owned = Element & { [owner]?: object; [treeOwner]?: object }

/** One native select with full-path labels; no checkbox tree, popup or data renderer. */
export function createTreeSelect(root: HTMLElement, options: TreeSelectOptions = {}): TreeSelectController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !["div", "section", "fieldset"].includes(root.localName)
    || !root.matches(".mui-tree-select[data-tree-select]") || (root as Owned)[owner]) throw new TypeError("Use an unowned native .mui-tree-select[data-tree-select] root.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["selection", "value", "defaultValue", "showPath", "separator"].includes(key))
    || options.showPath !== undefined && typeof options.showPath !== "boolean") throw new TypeError("Unsupported Tree Select options.")
  const selection = options.selection === undefined ? "any" : options.selection
  const separator = options.separator === undefined ? " / " : options.separator, showPath = options.showPath ?? true
  if (!["leaf", "any"].includes(selection) || typeof separator !== "string" || separator.length > 32) throw new TypeError("Use leaf/any selection and a separator up to 32 characters.")
  const own = (node: Element) => node.closest("[data-tree-select]") === root
  function one(selector: string, required = false) {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const source = one("[data-tree-select-source]", true)!, field = one("[data-tree-select-field]", true)!
  const controlNode = field.querySelector("[data-select-control]")
  if (!(controlNode instanceof view.HTMLSelectElement) || !own(controlNode)) throw new TypeError("Use one native Select host/control.")
  const control = controlNode, multiple = control.multiple, form = control.form
  const readout = one("[data-tree-select-value]"), status = one("[data-tree-select-status]"), clearNode = one("[data-tree-select-clear]")
  if (clearNode && (!(clearNode instanceof view.HTMLButtonElement) || clearNode.type !== "button"
    || !clearNode.textContent?.trim() || clearNode.closest("label,summary") || clearNode.hasAttribute("role")
    || clearNode.hasAttribute("popovertarget") || clearNode.hasAttribute("commandfor")
    || clearNode.querySelector("button,a,input,select,textarea,[tabindex]"))) throw new TypeError("Clear needs a separate labelled native type=button.")
  const clearButton = clearNode as HTMLButtonElement | null
  if (readout && readout === status || [readout, status, clearButton].some(node => node && (source.contains(node) || field.contains(node)))
    || [readout, status].some(node => node && (node.childElementCount || node.closest("label,button,summary")
      || node.matches("input,select,textarea,button,label")))) throw new TypeError("Readout/status/clear must be separate from source, Select host and native labels.")
  if (field.querySelector("[data-select-clear]")) throw new TypeError("Use the single Tree Select clear owner outside the Select host.")
  const initialChildren = [...control.childNodes], initialOptions = [...control.options]
  const initialState = initialOptions.map(option => ({ option, text: option.textContent, label: option.getAttribute("label"), selected: option.selected, defaultSelected: option.defaultSelected, disabled: option.disabled }))
  if ([...control.children].some(node => !(node instanceof view.HTMLOptionElement) || node.childElementCount)
    || initialOptions.some(option => !option.hasAttribute("value"))
    || new Set(initialOptions.map(option => option.value)).size !== initialOptions.length) throw new TypeError("Use direct plain-text native options with unique explicit values.")
  const placeholder = initialOptions.find(option => option.value === "") ?? null
  if (multiple && placeholder || !multiple && control.size <= 1 && (!placeholder || placeholder !== initialOptions[0] || placeholder.disabled)) {
    throw new TypeError("Single dropdowns require a first enabled empty placeholder; multiple selects cannot contain an empty choice.")
  }
  const records = new Map<string, Option>()
  for (const option of initialOptions) records.set(option.value, { element: option, disabled: option.disabled, lastDisabled: option.disabled })
  const token = {}, borrowed = new Set<HTMLElement>(), texts: Text[] = []
  const clearHidden = clearButton?.getAttribute("hidden") ?? null
  let lastClearHidden = clearHidden, connected = true, busy = false, generation = 0, error: unknown = null, fault = false
  let helper: SelectController | null = null, projection = new Map<string, Projection>()
  let defaults: string[] = [], defaultsChanged = false, refreshing = false, initialized = false
  let validityBefore = control.validity.customError ? control.validationMessage : "", validityLast = validityBefore
  const tasks = new Set<number>()
  const ownedNodes = [root, source, field, control, ...[readout, status, clearButton].filter((node): node is HTMLElement => !!node)]

  function live() { if (!connected) throw new Error("Tree Select is disconnected; use the handed-off native control directly.") }
  function nativeKeys() { return [...control.options].filter(option => option.selected && option.value).map(option => option.value) }
  function path(node: TreeNode) {
    const keys: string[] = []
    for (let current: TreeNode | null = node; current; current = current.parent) keys.unshift(current.key)
    return Object.freeze(keys)
  }
  function plan() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-tree-select[data-tree-select]")
      || root.hasAttribute("role") || one("[data-tree-select-source]", true) !== source || one("[data-tree-select-field]", true) !== field
      || !field.contains(control) || !own(control) || control.multiple !== multiple || control.form !== form
      || [readout, status, clearButton].some(node => node && (!root.contains(node) || !own(node)))
      || [readout, status].some(node => node && (node.childElementCount || node.closest("label,button,summary")))) throw new TypeError("Keep the original connected native source, Select mode/form and separate plain views.")
    if (source.contains(field) || field.contains(source) || (source as Owned)[treeOwner] && (source as Owned)[treeOwner] !== token
      || source.querySelector("input,select,textarea,button,script,style,link,iframe,object,embed,[is],[data-tree],[data-tree-select],[contenteditable]:not([contenteditable=false])")) throw new TypeError("Use an unowned passive Tree source; never hide or steal a live Tree's form controls.")
    const next = readTreeHierarchy(source), choices = new Map<string, Projection>(), labels = new Map<TreeNode, string>(), disabled = new Map<TreeNode, boolean>()
    for (const node of next.nodes) {
      if (node.label.localName !== "span" || node.checkbox
        || [node.element, node.label, node.branch, node.summary].some(element => element
          && ((element as Owned)[treeOwner] && (element as Owned)[treeOwner] !== token || (element as Owned)[owner] && (element as Owned)[owner] !== token))) throw new TypeError("Source labels must be passive, unowned spans.")
      const label = `${node.parent ? labels.get(node.parent)! + separator : ""}${treeLabel(node)}`
      if (label.length > 2048) throw new RangeError("Native full-path labels must fit 2048 characters.")
      labels.set(node, label)
      const blocked = source.hasAttribute("data-tree-disabled") || node.element.hasAttribute("data-tree-disabled")
        || !!node.parent && disabled.get(node.parent)! || records.get(node.key)?.disabled === true
      disabled.set(node, blocked)
      if (!node.element.hasAttribute("data-tree-group") && (selection === "any" || node.branch === null)) choices.set(node.key, { node, label, disabled: blocked })
    }
    return { next, choices }
  }
  function keysFor(value: TreeSelectValue, choices = projection) {
    const keys: unknown = multiple ? value : value === null ? [] : [value]
    if (!Array.isArray(keys) || !multiple && Array.isArray(value) || keys.some(key => typeof key !== "string" || !key)
      || new Set(keys).size !== keys.length || keys.some(key => !choices.has(key) || choices.get(key)!.disabled)) throw new TypeError("Use an enabled known string/null in single mode, or unique enabled strings[] in multiple mode.")
    return [...keys] as string[]
  }
  function defaultKeys() {
    const keys = [...control.options].filter(option => option.defaultSelected && option.value).map(option => option.value)
    if (!multiple && keys.length > 1) throw new TypeError("Single Tree Select allows one default data key.")
    return keys
  }
  function keep(keys: readonly string[], choices = projection) { return keys.filter(key => choices.has(key) && !choices.get(key)!.disabled) }
  function available(node: HTMLElement) {
    if (!node.isConnected || node.matches(":disabled") || node.closest("[hidden],[inert]")) return false
    for (let element: HTMLElement | null = node; element; element = element.parentElement) {
      const style = view!.getComputedStyle(element)
      if (style.display === "none" || style.visibility === "hidden") return false
      if (element.localName === "details" && !(element as HTMLDetailsElement).open && !element.firstElementChild?.contains(node)) return false
    }
    return true
  }
  function text(node: HTMLElement | null, value: string) {
    if (!node || !root.contains(node) || !own(node) || node.childElementCount) return
    let lease = texts.find(item => item.node === node)
    if (!lease) { lease = { node, before: node.textContent ?? "", last: node.textContent ?? "" }; texts.push(lease) }
    if (node.textContent !== lease.last) lease.before = node.textContent ?? ""
    if (node.textContent !== value) node.textContent = value
    lease.last = value
  }
  function gate() {
    const current = control.validity.customError ? control.validationMessage : ""
    if (current !== validityLast) validityBefore = current
    const message = validityBefore || (fault ? "Tree Select source is invalid. Repair it before submitting." : "")
    if (current !== message) control.setCustomValidity(message)
    validityLast = message
  }
  function present() {
    const keys = fault ? [] : keep(nativeKeys())
    text(readout, keys.map(key => showPath ? projection.get(key)!.label : treeLabel(projection.get(key)!.node)).join("\n"))
    const missing = defaults.filter(key => !projection.has(key) || projection.get(key)!.disabled)
    text(status, fault ? "Tree Select cannot use the current source." : missing.length ? "Some default keys are unavailable; reset restores only eligible defaults." : "")
    if (clearButton) {
      const hide = !keys.length || !available(control)
      if (hide && document!.activeElement === clearButton && available(control)) { control.focus({ preventScroll: true }); live() }
      if (hide) clearButton.setAttribute("hidden", "")
      else clearButton.removeAttribute("hidden")
      lastClearHidden = hide ? "" : null
    }
    gate()
  }
  function state(): TreeSelectState {
    live()
    const keys = Object.freeze(fault ? [] : keep(nativeKeys()))
    return Object.freeze({
      value: multiple ? keys : keys[0] ?? null, keys, paths: Object.freeze(keys.map(key => path(projection.get(key)!.node))),
      defaultKeys: Object.freeze([...defaults]),
      unavailableDefaultKeys: Object.freeze(defaults.filter(key => !projection.has(key) || projection.get(key)!.disabled)),
      valid: !control.willValidate || !fault && control.validity.valid,
    })
  }
  function mark(changes: MutationRecord[]) {
    for (const change of changes) if (change.attributeName === "selected" && change.target instanceof view!.HTMLOptionElement) defaultsChanged = true
    for (const record of records.values()) if (record.element.disabled !== record.lastDisabled) record.disabled = record.element.disabled
  }
  function relevant(changes: MutationRecord[]) {
    return changes.filter(change => change.target === root || change.target === field || change.target === control || source.contains(change.target)
      || change.type === "attributes" && change.target instanceof view!.Element && control.contains(change.target)
      || [...change.removedNodes].some(node => node === root || node.contains(root)))
  }
  function observe() {
    if (!connected) return
    observer.observe(source, { childList: true, subtree: true, characterData: true, attributes: true })
    observer.observe(control, { childList: true, subtree: true, attributes: true, attributeFilter: ["value", "label", "selected", "disabled", "multiple", "size", "form", "required", "role"] })
    observer.observe(root, { childList: true, attributes: true, attributeFilter: ["data-tree-select", "role"] })
    observer.observe(field, { childList: true, attributes: true, attributeFilter: ["data-tree-select-field", "data-select", "role"] })
    for (let parent = root.parentElement; parent; parent = parent.parentElement) observer.observe(parent, { childList: true })
  }
  const observer = new view.MutationObserver(changes => {
    const pending = relevant(changes); if (!pending.length || !connected) return
    mark(pending)
    if (!root.isConnected) { try { disconnect() } catch { /* Teardown reports structural failures. */ }; return }
    try { refresh() } catch { /* Native validity/error notification remains active. */ }
  })
  function report(cause: unknown) {
    error = cause; fault = true
    if (connected) { gate(); text(status, cause instanceof Error ? cause.message : "Tree Select source is invalid.") }
    root.dispatchEvent(new view!.CustomEvent("mui:tree-select-error", { detail: { error: cause } }))
  }
  function guard() {
    live(); if (busy) throw new Error("Tree Select operations may not reenter.")
    const pending = relevant(observer.takeRecords())
    if (pending.length) { mark(pending); if (!refreshing) refresh() }
    if (fault && !refreshing) refresh()
  }
  function run(action: () => void) {
    guard(); observer.disconnect(); busy = true
    try { action(); live() } catch (cause) { if (connected) report(cause); throw cause }
    finally { busy = false; observe() }
  }
  function assertProjection() {
    if (initialized && [...control.options].some(option => records.get(option.value)?.element !== option)) throw new Error("Do not add or rename projected options; edit the source and refresh.")
  }
  function apply(choices: Map<string, Projection>, selected: readonly string[]) {
    const desired: HTMLOptionElement[] = placeholder ? [placeholder] : []
    for (const [key, choice] of choices) {
      let record = records.get(key)
      if (!record) {
        const element = document!.createElement("option"); element.value = key
        record = { element, disabled: false, lastDisabled: false }; records.set(key, record)
      }
      if (record.element.textContent !== choice.label) record.element.textContent = choice.label
      if (record.element.hasAttribute("label")) record.element.label = choice.label
      record.element.disabled = choice.disabled; record.lastDisabled = choice.disabled
      desired.push(record.element)
    }
    const actual = [...control.options]
    if (actual.length !== desired.length || actual.some((option, i) => option !== desired[i])) control.replaceChildren(...desired)
    for (const key of records.keys()) if (key && !choices.has(key)) records.delete(key)
    const eligibleDefaults = keep(defaults, choices)
    for (const option of desired) {
      const selectedDefault = option.value ? eligibleDefaults.includes(option.value) : !eligibleDefaults.length && control.size <= 1
      if (option.defaultSelected !== selectedDefault) option.defaultSelected = selectedDefault
    }
    const value = keep(selected, choices)
    helper!.setValue(multiple ? value : value[0] ?? null)
    // A size>1 required select must not treat the empty placeholder as a real chosen item.
    if (!multiple && !value.length && control.size > 1) control.selectedIndex = -1
    projection = choices; fault = false; present()
  }
  function refresh() {
    const before = refreshing; refreshing = true
    try { run(() => {
      const next = plan(); assertProjection()
      const current = nativeKeys()
      if (defaultsChanged) { defaults = defaultKeys(); defaultsChanged = false }
      generation++
      apply(next.choices, current)
    }) } finally { refreshing = before }
  }
  function setValue(value: TreeSelectValue) {
    guard(); const keys = keysFor(value)
    run(() => { generation++; helper!.setValue(multiple ? keys : keys[0] ?? null); present() })
  }
  function setDefaultValue(value: TreeSelectValue) {
    guard(); const keys = keysFor(value)
    run(() => { generation++; defaults = keys; defaultsChanged = false; apply(projection, nativeKeys()) })
  }
  function notify(action: "select" | "clear", event?: Event) {
    if (connected) root.dispatchEvent(new view!.CustomEvent("mui:tree-select-change", { detail: { ...state(), action, event } }))
  }
  function change(event: Event) {
    try { refresh(); notify("select", event) } catch { /* refresh reports a guarded source failure. */ }
  }
  function clear(event?: Event) {
    guard()
    if (!nativeKeys().length || !available(control)) return false
    if (document!.activeElement === clearButton) { control.focus({ preventScroll: true }); live() }
    setValue(multiple ? [] : null); notify("clear", event); return true
  }
  function clearClick(event: MouseEvent) {
    const current = generation
    const id = view!.setTimeout(() => {
      tasks.delete(id)
      if (connected && generation === current && !event.defaultPrevented && clearButton && !clearButton.matches(":disabled")) {
        try { clear(event) } catch { /* Source/runtime failure is reported by the guarded operation. */ }
      }
    }, 0)
    tasks.add(id)
  }
  function reset(event: Event) {
    if (!connected || event.target !== form) return
    try { refresh() } catch { return }
    const current = generation, id = view!.setTimeout(() => {
      tasks.delete(id)
      if (connected && generation === current) { try { refresh() } catch { /* Already reported. */ } }
    }, 0)
    tasks.add(id)
  }
  function submit(event: Event) {
    if (!connected || event.target !== form) return
    try { refresh() } catch { /* Gate and event cancellation prevent invalid source submission. */ }
    if (!control.matches(":disabled") && (fault || !control.validity.valid)) event.preventDefault()
  }
  function delegateError(event: Event) { report(new Error((event as CustomEvent<{ message: string }>).detail.message)) }
  function disconnect() {
    if (!connected) return
    let failure: unknown, failed = false
    if (initialized && root.isConnected && !busy) { try { refresh() } catch (cause) { failed = true; failure = cause } }
    connected = false; generation++; observer.disconnect()
    tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    control.removeEventListener("change", change); clearButton?.removeEventListener("click", clearClick)
    document!.removeEventListener("reset", reset, true); document!.removeEventListener("submit", submit, true)
    field.removeEventListener("mui:select-error", delegateError)
    helper?.disconnect()
    if (failed) {
      for (const [key, record] of records) if (key) record.element.remove()
      control.selectedIndex = -1
    }
    if (clearButton && clearHidden !== null && document!.activeElement === clearButton && available(control)) control.focus({ preventScroll: true })
    if (clearButton && clearButton.getAttribute("hidden") === lastClearHidden) {
      if (clearHidden === null) clearButton.removeAttribute("hidden")
      else clearButton.setAttribute("hidden", clearHidden)
    }
    for (const lease of texts) if (!lease.node.childElementCount && lease.node.textContent === lease.last) lease.node.textContent = lease.before
    if ((control.validity.customError ? control.validationMessage : "") === validityLast) control.setCustomValidity(validityBefore)
    for (const node of borrowed) {
      if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
      if ((node as Owned)[treeOwner] === token) delete (node as Owned)[treeOwner]
    }
    borrowed.clear(); records.clear(); texts.length = 0; projection.clear(); defaults = []
    if (failed) throw failure
  }
  const controller: TreeSelectController = {
    control, get filter() { return helper?.filter ?? null }, get connected() { return connected }, get error() { return error },
    get value() { return state().value }, get state() { return state() },
    setValue, setDefaultValue, setFilter(value) { guard(); helper!.setFilter(value) }, clear: () => clear(), refresh, disconnect,
  }
  try {
    const next = plan()
    for (const key of records.keys()) if (key && !next.next.byKey.has(key)) throw new TypeError("Authored fallback option keys must exist in the hierarchy.")
    defaults = options.defaultValue === undefined ? defaultKeys() : keysFor(options.defaultValue, next.choices)
    const current = options.value === undefined ? options.defaultValue === undefined ? nativeKeys() : defaults : keysFor(options.value, next.choices)
    for (const node of ownedNodes) if ((node as Owned)[owner]) throw new Error("Tree Select view/source already has an owner.")
    helper = createSelect(field)
    for (const node of [...ownedNodes, ...helper.filter ? [helper.filter] : []]) { (node as Owned)[owner] = token; borrowed.add(node) }
    ;(source as Owned)[treeOwner] = token
    run(() => apply(next.choices, current)); initialized = true
    control.addEventListener("change", change); clearButton?.addEventListener("click", clearClick)
    document.addEventListener("reset", reset, true); document.addEventListener("submit", submit, true)
    field.addEventListener("mui:select-error", delegateError); observe()
  } catch (cause) {
    if (!helper) { connected = false; throw cause }
    try { disconnect() } finally {
      control.replaceChildren(...initialChildren)
      for (const item of initialState) {
        item.option.textContent = item.text
        if (item.label === null) item.option.removeAttribute("label"); else item.option.setAttribute("label", item.label)
        item.option.disabled = item.disabled; item.option.defaultSelected = item.defaultSelected; item.option.selected = item.selected
      }
    }
    throw cause
  }
  return controller
}
