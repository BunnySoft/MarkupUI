import { createSelect } from "../native-select.js"
import type { SelectController } from "../native-select.js"

export interface TreeSelectItem {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
  readonly group?: boolean
  readonly children?: readonly TreeSelectItem[] | undefined
}
interface TreeNode {
  key: string
  label: string
  parent: TreeNode | null
  branch: boolean
  disabled: boolean
  group: boolean
}
/** @internal Validated data, without a native source tree or active Tree registration. */
export interface TreeSelectData {
  readonly items: readonly TreeSelectItem[]
  readonly nodes: readonly TreeNode[]
}
export function treeSelectData(items: readonly TreeSelectItem[]): TreeSelectData {
  const nodes: TreeNode[] = [], keys = new Set<string>()
  function visit(items: readonly TreeSelectItem[], parent: TreeNode | null, depth: number): readonly TreeSelectItem[] {
    if (!Array.isArray(items) || items.length && depth > 64) throw new TypeError("Tree Select supports 64 hierarchy levels.")
    return Object.freeze(Array.from(items, item => {
      if (!item || typeof item !== "object" || Object.keys(item).some(key => !["value", "label", "disabled", "group", "children"].includes(key))
        || typeof item.value !== "string" || !item.value || item.value.length > 256 || keys.has(item.value) || keys.size >= 2000
        || typeof item.label !== "string" || !item.label.trim() || item.label.length > 1024
        || [item.disabled, item.group].some(flag => flag !== undefined && typeof flag !== "boolean")) throw new TypeError("Use at most 2000 unique keys, nonempty labels and boolean flags.")
      keys.add(item.value)
      const node: TreeNode = { key: item.value, label: item.label, parent, branch: item.children !== undefined, disabled: !!item.disabled || !!parent?.disabled, group: !!item.group }
      nodes.push(node)
      const children = item.children === undefined ? undefined : visit(item.children, node, depth + 1)
      return Object.freeze({ value: item.value, label: item.label, disabled: !!item.disabled, group: !!item.group, children })
    }))
  }
  return { items: visit(items, null, 1), nodes }
}

export type TreeSelectValue = string | null | readonly string[]
export interface TreeSelectSettings {
  selection?: "leaf" | "any"
  showPath?: boolean
  separator?: string
}
export interface TreeSelectOptions extends TreeSelectSettings {
  value?: TreeSelectValue
  defaultValue?: TreeSelectValue
}
export function treeSelectSettings(value: TreeSelectSettings): Readonly<Required<TreeSelectSettings>> {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || Object.keys(value).some(key => !["selection", "showPath", "separator"].includes(key))) throw new TypeError("Unsupported Tree Select settings.")
  const result = { selection: value.selection === undefined ? "any" : value.selection,
    showPath: value.showPath === undefined ? true : value.showPath, separator: value.separator === undefined ? " / " : value.separator }
  if (!["leaf", "any"].includes(result.selection) || typeof result.showPath !== "boolean"
    || typeof result.separator !== "string" || result.separator.length > 32) throw new TypeError("Use leaf/any, boolean showPath and separator up to 32 characters.")
  return Object.freeze(result)
}
export function treeSelectKeys(value: TreeSelectValue, multiple: boolean): string[] {
  const keys: unknown = multiple ? value : value === null ? [] : [value]
  if (!Array.isArray(keys) || keys.length > 2000 || keys.some(key => typeof key !== "string" || !key || key.length > 256)
    || new Set(keys).size !== keys.length) throw new TypeError("Use a string/null or unique multiple string keys.")
  return [...keys] as string[]
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
  assertMutable(): void
  readonly resume: TreeSelectResume
  setData(data: TreeSelectData): void
}
/** @internal Retains unavailable defaults and explicit option disabled overrides. */
export interface TreeSelectResume {
  readonly value: TreeSelectValue
  readonly defaults: readonly string[]
  readonly disabled: readonly string[]
}
interface Projection { node: TreeNode; label: string; disabled: boolean }
interface Option { element: HTMLOptionElement; disabled: boolean; lastDisabled: boolean }
interface Text { node: HTMLElement; before: string; last: string }
const owner = Symbol.for("markup-ui.tree-select.owner")
type Owned = Element & { [owner]?: object }

/** One native select over bounded data; no hidden native tree or competing selection engine. */
export function createTreeSelect(root: HTMLElement, data: TreeSelectData, options: TreeSelectOptions = {}, events = root, resume?: TreeSelectResume): TreeSelectController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !["div", "section", "fieldset"].includes(root.localName)
    || !root.matches(".m-tree-select[data-tree-select]") || (root as Owned)[owner]) throw new TypeError("Use an unowned native data-tree-select root.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["selection", "value", "defaultValue", "showPath", "separator"].includes(key))) throw new TypeError("Unsupported Tree Select options.")
  const { value: initialValue, defaultValue: initialDefault, ...settings } = options
  const { selection, separator, showPath } = treeSelectSettings(settings)
  const own = (node: Element) => node.closest("[data-tree-select]") === root
  function one(selector: string, required = false) {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const field = one("[data-tree-select-field]", true)!
  const controlNode = field.querySelector("[data-select-control]")
  if (!(controlNode instanceof view.HTMLSelectElement) || !own(controlNode)) throw new TypeError("Use one native Select control.")
  const control = controlNode, multiple = control.multiple, form = control.form
  const readout = one("[data-tree-select-value]"), status = one("[data-tree-select-status]"), clearNode = one("[data-tree-select-clear]")
  if (clearNode && (!(clearNode instanceof view.HTMLButtonElement) || clearNode.type !== "button"
    || !clearNode.textContent?.trim() || clearNode.closest("label,summary") || clearNode.hasAttribute("role")
    || clearNode.hasAttribute("popovertarget") || clearNode.hasAttribute("commandfor")
    || clearNode.querySelector("button,a,input,select,textarea,[tabindex]"))) throw new TypeError("Clear requires a named native type=button.")
  const clearButton = clearNode as HTMLButtonElement | null
  if (readout && readout === status || [readout, status, clearButton].some(node => node && field.contains(node))
    || [readout, status].some(node => node && (node.childElementCount || node.closest("label,button,summary")
      || node.matches("input,select,textarea,button,label")))) throw new TypeError("Keep text-only views and clear outside source and Select.")
  if (field.querySelector("[data-select-clear]")) throw new TypeError("Tree Select owns clear outside Select.")
  const initialChildren = [...control.childNodes], initialOptions = [...control.options]
  const initialState = initialOptions.map(option => ({ option, text: option.textContent, label: option.getAttribute("label"), selected: option.selected, defaultSelected: option.defaultSelected, disabled: option.disabled }))
  if ([...control.children].some(node => !(node instanceof view.HTMLOptionElement) || node.childElementCount)
    || initialOptions.some(option => !option.hasAttribute("value"))
    || new Set(initialOptions.map(option => option.value)).size !== initialOptions.length) throw new TypeError("Options require unique values and plain text.")
  const placeholder = initialOptions.find(option => option.value === "") ?? null
  if (multiple && placeholder || !multiple && control.size <= 1 && (!placeholder || placeholder !== initialOptions[0] || placeholder.disabled)) {
    throw new TypeError("Only single dropdowns require a first enabled empty placeholder.")
  }
  const records = new Map<string, Option>()
  for (const option of initialOptions) records.set(option.value, { element: option, disabled: resume ? resume.disabled.includes(option.value) : option.disabled, lastDisabled: option.disabled })
  const token = {}, texts = new Map<HTMLElement, Text>()
  const clearHidden = clearButton?.getAttribute("hidden") ?? null
  let lastClearHidden = clearHidden, connected = true, busy = false, generation = 0, error: unknown = null, fault = false
  let helper: SelectController | null = null, projection = new Map<string, Projection>()
  let defaults: string[] = [], defaultsChanged = false, refreshing = false, initialized = false
  let validityBefore = control.validity.customError ? control.validationMessage : "", validityLast = validityBefore
  const tasks = new Set<number>()
  const ownedNodes = [root, field, control, ...[readout, status, clearButton].filter((node): node is HTMLElement => !!node)]

  function live() { if (!connected) throw new Error("Tree Select is disconnected.") }
  function nativeKeys() { return [...control.options].filter(option => option.selected && option.value).map(option => option.value) }
  function path(node: TreeNode) {
    const keys: string[] = []
    for (let current: TreeNode | null = node; current; current = current.parent) keys.unshift(current.key)
    return Object.freeze(keys)
  }
  function plan(input = data) {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".m-tree-select[data-tree-select]")
      || root.hasAttribute("role") || one("[data-tree-select-field]", true) !== field
      || !field.contains(control) || !own(control) || control.multiple !== multiple || control.form !== form
      || [readout, status, clearButton].some(node => node && (!root.contains(node) || !own(node)))
      || [readout, status].some(node => node && (node.childElementCount || node.closest("label,button,summary")))) throw new TypeError("Keep connected source, Select mode/form and text-only views.")
    const choices = new Map<string, Projection>(), labels = new Map<TreeNode, string>()
    for (const node of input.nodes) {
      const label = `${node.parent ? labels.get(node.parent)! + separator : ""}${node.label}`
      if (label.length > 2048) throw new RangeError("Native full-path labels must fit 2048 characters.")
      labels.set(node, label)
      if (!node.group && (selection === "any" || !node.branch)) choices.set(node.key, { node, label, disabled: node.disabled || records.get(node.key)?.disabled === true })
    }
    return choices
  }
  function keysFor(value: TreeSelectValue, choices = projection) {
    const keys = treeSelectKeys(value, multiple)
    if (keys.some(key => !choices.has(key) || choices.get(key)!.disabled)) throw new TypeError("Use known enabled keys.")
    return keys
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
    let lease = texts.get(node)
    if (!lease) { lease = { node, before: node.textContent ?? "", last: node.textContent ?? "" }; texts.set(node, lease) }
    if (node.textContent !== lease.last) lease.before = node.textContent ?? ""
    if (node.textContent !== value) node.textContent = value
    lease.last = value
  }
  function gate() {
    const current = control.validity.customError ? control.validationMessage : ""
    if (current !== validityLast) validityBefore = current
    const message = validityBefore || (fault ? "Repair invalid Tree Select source before submitting." : "")
    if (current !== message) control.setCustomValidity(message)
    validityLast = message
  }
  function present() {
    const keys = fault ? [] : keep(nativeKeys())
    text(readout, keys.map(key => showPath ? projection.get(key)!.label : projection.get(key)!.node.label).join("\n"))
    const missing = defaults.filter(key => !projection.has(key) || projection.get(key)!.disabled)
    text(status, fault ? "Invalid Tree Select source." : missing.length ? "Reset skips unavailable default keys." : "")
    if (clearButton) {
      const hide = !keys.length || !available(control) || clearButton.disabled
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
    return changes.filter(change => change.target === root || change.target === field || change.target === control
      || change.type === "attributes" && change.target instanceof view!.Element && control.contains(change.target)
      || [...change.removedNodes].some(node => node === root || node.contains(root)))
  }
  function observe() {
    if (!connected) return
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
    if (connected) { gate(); text(status, cause instanceof Error ? cause.message : "Invalid Tree Select source.") }
    events.dispatchEvent(new view!.CustomEvent("m:tree-select-error", { bubbles: true, detail: { error: cause } }))
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
    if (initialized && [...control.options].some(option => records.get(option.value)?.element !== option)) throw new Error("Edit source, not projected option keys.")
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
    projection = choices; fault = false; error = null; present()
  }
  function refresh(invalidate = true) {
    const before = refreshing; refreshing = true
    try { run(() => {
      const next = plan(); assertProjection()
      const current = nativeKeys()
      if (defaultsChanged) { defaults = defaultKeys(); defaultsChanged = false }
      if (invalidate) generation++
      apply(next, current)
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
    if (connected) events.dispatchEvent(new view!.CustomEvent("m:tree-select-change", { bubbles: true, detail: { ...state(), action, event } }))
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
      // Reset already invalidated older actions; reconciliation must preserve newer ones.
      if (connected && generation === current) { try { refresh(false) } catch { /* Already reported. */ } }
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
    field.removeEventListener("m:select-error", delegateError)
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
    for (const lease of texts.values()) if (!lease.node.childElementCount && lease.node.textContent === lease.last) lease.node.textContent = lease.before
    if ((control.validity.customError ? control.validationMessage : "") === validityLast) control.setCustomValidity(validityBefore)
    for (const node of ownedNodes) {
      if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
    }
    records.clear(); texts.clear(); projection.clear(); defaults = []
    if (failed) throw failure
  }
  const controller: TreeSelectController = {
    control, get filter() { return helper?.filter ?? null }, get connected() { return connected }, get error() { return error },
    get value() { return state().value }, get state() { return state() },
    get resume() {
      mark(relevant(observer.takeRecords()))
      return { value: state().value, defaults: defaultsChanged ? defaultKeys() : [...defaults], disabled: [...records].filter(([, record]) => record.disabled).map(([key]) => key) }
    },
    assertMutable: guard,
    setData(next) {
      guard()
      const choices = plan(next)
      run(() => {
        assertProjection()
        helper!.refresh()
        apply(choices, nativeKeys()); data = next; generation++
      })
    },
    setValue, setDefaultValue, setFilter(value) { guard(); helper!.setFilter(value) }, clear: () => clear(), refresh, disconnect,
  }
  try {
    const next = plan()
    for (const key of records.keys()) if (!resume && key && !data.nodes.some(node => node.key === key)) throw new TypeError("Fallback option keys must exist in source.")
    defaults = initialDefault === undefined ? resume ? [...resume.defaults] : defaultKeys() : keysFor(initialDefault, next)
    if (!multiple && defaults.length > 1) throw new TypeError("Single Tree Select allows one default data key.")
    const current = initialValue === undefined ? initialDefault === undefined ? nativeKeys() : defaults : keysFor(initialValue, next)
    for (const node of ownedNodes) if ((node as Owned)[owner]) throw new Error("Tree Select view/source already has an owner.")
    helper = createSelect(field)
    if (helper.filter) ownedNodes.push(helper.filter)
    for (const node of ownedNodes) (node as Owned)[owner] = token
    run(() => apply(next, current)); initialized = true
    control.addEventListener("change", change); clearButton?.addEventListener("click", clearClick)
    document.addEventListener("reset", reset, true); document.addEventListener("submit", submit, true)
    field.addEventListener("m:select-error", delegateError); observe()
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
