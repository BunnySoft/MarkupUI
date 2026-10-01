import { datePickerDefault, datePickerEntry, datePickerInputType, datePickerValues, isDatePickerTypeSupported, quarterPattern, validateDatePickerConstraints } from "./native.js"
import type { DatePickerProfile, DatePickerValue } from "./native.js"
import { prepareTemporalActionFocus } from "../temporal/focus.js"

export type { DatePickerValue } from "./native.js"
export interface DatePickerState {
  /** Null is an invalid/incomplete native draft, distinct from an empty string. */
  readonly value: DatePickerValue | null
  readonly draft: string | readonly [string, string]
  readonly empty: boolean
  readonly partial: boolean
  readonly complete: boolean
  readonly ordered: boolean | null
  readonly nativeValid: boolean
  readonly badInput: boolean
  readonly composing: boolean
}
export interface DatePickerController {
  readonly inputs: readonly HTMLInputElement[]
  readonly type: DatePickerProfile
  readonly connected: boolean
  readonly value: DatePickerValue | null
  readonly defaultValue: DatePickerValue
  readonly state: DatePickerState
  readonly error: unknown
  setValue(value: DatePickerValue): void
  setDefaultValue(value: DatePickerValue): void
  setClearable(value: boolean): void
  configure(options: DatePickerConfiguration): void
  clear(): boolean
  refresh(): void
  connect(): void
  disconnect(): void
}
export interface DatePickerOptions {
  /** Native types are inferred. Year/quarter explicitly map number/text fields. */
  readonly type?: DatePickerProfile
  readonly clearable?: boolean
  readonly value?: DatePickerValue
  readonly defaultValue?: DatePickerValue
}
export interface DatePickerConfiguration {
  readonly type: DatePickerProfile
  readonly value: DatePickerValue
  readonly defaultValue: DatePickerValue
}
interface Attribute { node: HTMLElement; name: string; before: string | null; base: string | null; last: string | null }
const owner = Symbol.for("markup-ui.date-picker.owner")
type Owned = Element & { [owner]?: DatePickerController }

/** Native calendar/wall-clock fields, never epoch conversion, calendar rendering or linked-bound mutation. */
export function createDatePicker(root: HTMLElement, options: DatePickerOptions = {}): DatePickerController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches("[data-date-picker]")) throw new TypeError("Date Picker needs an authored data-date-picker root.")
  if (options.clearable !== undefined && typeof options.clearable !== "boolean") throw new TypeError("clearable must be boolean.")
  const own = (node: Element) => node.closest("[data-date-picker], m-date-picker") === root
  const fields = [...root.querySelectorAll("[data-date-control]")].filter(own)
  if (fields.length < 1 || fields.length > 2 || fields.some(field => !(field instanceof view.HTMLInputElement))) throw new TypeError("Author one native input or exactly two same-mode range endpoints.")
  const inputs = Object.freeze(fields as HTMLInputElement[])
  const nativeType = inputs[0]!.getAttribute("type")?.toLowerCase()
  if (options.type === undefined && (nativeType === "year" || nativeType === "quarter"))
    throw new TypeError("Use a supported native type; year/quarter require an explicit number/text profile.")
  function profile(value: unknown): DatePickerProfile {
    if (value === "year" || value === "quarter") {
      if (inputs.length !== 1) throw new TypeError("Year and quarter profiles use one field.")
      return value
    }
    if (value !== "date" && value !== "month" && value !== "week" && value !== "datetime-local"
      || !isDatePickerTypeSupported(document!, value)) throw new TypeError("Use a supported native date, month, week or datetime-local mode, or an explicit year/quarter profile.")
    return value
  }
  let type = profile(options.type ?? nativeType)
  const initialValues = options.value === undefined ? undefined : datePickerValues(document!, type, inputs.length === 2, options.value)
  const initialDefaults = options.defaultValue === undefined ? undefined : datePickerValues(document!, type, inputs.length === 2, options.defaultValue)
  let initializing = true
  function one(selector: string) {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1) throw new TypeError(`Use at most one owned ${selector}.`)
    return nodes[0] ?? null
  }
  const clearNode = one("[data-date-clear]"), output = one("[data-date-output]")
  if (clearNode && !(clearNode instanceof view.HTMLButtonElement)) throw new TypeError("Clear requires a native button.")
  const clearButton = clearNode as HTMLButtonElement | null
  const nodes = [root, ...inputs, ...[clearButton, output].filter((node): node is HTMLElement => !!node)]
  if (new Set(nodes).size !== nodes.length) throw new TypeError("Date fields, output and actions must be distinct.")
  for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Date Picker node already has an owner.")
  function named(input: HTMLInputElement) {
    return !!(input.getAttribute("aria-label")?.trim() || [...input.labels ?? []].some(label => label.textContent?.trim())
      || input.getAttribute("aria-labelledby")?.trim().split(/\s+/).some(id => document!.getElementById(id)?.textContent?.trim()))
  }
  function constraints(next = type) {
    for (const input of inputs) validateDatePickerConstraints(next, {
      min: input.getAttribute("min"), max: input.getAttribute("max"), step: input.getAttribute("step"), pattern: input.getAttribute("pattern"),
    })
  }
  function anatomy(requireConnection = true) {
    const current = [...root.querySelectorAll("[data-date-control]")].filter(own)
    if (requireConnection && (!root.isConnected || root.getRootNode() !== document) || !root.matches("[data-date-picker]")
      || root.closest("label, button, a[href], summary")
      || current.length !== inputs.length || current.some((node, index) => node !== inputs[index])
      || one("[data-date-clear]") !== clearButton || one("[data-date-output]") !== output
      || nodes.some(node => node !== root && (!root.contains(node) || !own(node)))
      || inputs.some(input => input.type !== datePickerInputType(type) || input.getAttribute("type")?.toLowerCase() !== datePickerInputType(type) || requireConnection && !named(input)
        || input.hasAttribute("role") || input.hidden || input.form !== inputs[0]!.form)) throw new TypeError("Keep original labelled same-mode endpoints, their order and actual common form owner.")
    for (const input of inputs) {
      datePickerEntry(document!, type, input)
      if (input.hasAttribute("value") && (!initializing || !initialDefaults)) datePickerDefault(document!, type, input.defaultValue)
    }
    constraints()
    if (clearButton && (clearButton.getAttribute("type")?.toLowerCase() !== "button"
      || !(clearButton.getAttribute("aria-label")?.trim() || clearButton.textContent?.trim())
      || clearButton.hasAttribute("role") || clearButton.getAttribute("aria-hidden") === "true"
      || clearButton.hasAttribute("popovertarget") || clearButton.hasAttribute("commandfor")
      || clearButton.parentElement?.closest("label, button, a[href], summary")
      || clearButton.querySelector("input, button, select, textarea, a[href], [tabindex], [contenteditable], [role]"))) throw new TypeError("Use a separate labelled native type=button clear action.")
    if (output && (!["span", "p"].includes(output.localName) || output.children.length || output.hasAttribute("role") || output.hasAttribute("aria-live")
      || output.hasAttribute("tabindex") || output.isContentEditable
      || output.closest('label, button, a[href], [aria-live]:not([aria-live="off" i]), [role~="alert" i], [role~="status" i], [role~="log" i]'))) throw new TypeError("Readout must be separate plain nonlive text.")
  }
  anatomy()
  if (clearButton && !clearButton.hidden || output && !output.hidden) throw new TypeError("Keep custom clear/readout hidden for usable native no-JS fallback.")
  let connected = false, generation = 0, error: unknown = null
  let reset: Event | null = null
  let clearable = options.clearable ?? true, notifiedValue: DatePickerValue | null = null, notifiedDraft = ""
  const composing = new Set<HTMLInputElement>()
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>(), generated = new WeakSet<Event>()
  const profileAttributes: Attribute[] = []
  let outputBefore = output?.textContent ?? "", outputLast = outputBefore
  function lease(node: HTMLElement, name: string, enhance = false) {
    const before = node.getAttribute(name)
    attributes.push({ node, name, before, base: enhance ? null : before, last: before })
  }
  if (clearButton) { lease(clearButton, "hidden", true); lease(clearButton, "disabled") }
  if (output) lease(output, "hidden", true)
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const item = [...attributes, ...profileAttributes].find(item => item.node === record.target && item.name === record.attributeName)
      if (item) item.before = item.base = item.last = item.node.getAttribute(item.name)
    }
  }
  function write(item: Attribute, value: string | null) {
    if (item.node.getAttribute(item.name) !== value) {
      if (value === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, value)
    }
    item.last = value
  }
  function applyProfile() {
    const settings = type === "year" ? { min: "1", max: "9999", step: "1" } : type === "quarter" ? { pattern: quarterPattern } : {}
    for (const input of inputs) for (const [name, value] of Object.entries(settings)) {
      if (!input.hasAttribute(name)) {
        const item: Attribute = { node: input, name, before: null, base: value, last: value }
        input.setAttribute(name, value)
        profileAttributes.push(item)
      }
    }
  }
  function restoreProfile() {
    for (const item of profileAttributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    profileAttributes.length = 0
  }
  function state(): DatePickerState {
    const values = inputs.map(input => input.value), parsed = inputs.map(input => datePickerEntry(document!, type, input))
    const badInput = parsed.some(value => value === null), count = values.filter(Boolean).length
    const complete = count === inputs.length && !badInput
    return Object.freeze({
      value: badInput ? null : inputs.length === 1 ? parsed[0]!.value : Object.freeze([parsed[0]!.text, parsed[1]!.text] as const),
      draft: inputs.length === 1 ? values[0]! : Object.freeze([values[0]!, values[1]!] as const),
      empty: count === 0 && !badInput,
      partial: badInput || count > 0 && count < inputs.length,
      complete,
      ordered: inputs.length === 2 && complete ? parsed[0]!.coordinate! <= parsed[1]!.coordinate! : null,
      nativeValid: inputs.every(input => !input.willValidate || input.validity.valid),
      badInput,
      composing: composing.size > 0,
    })
  }
  function defaults(): DatePickerValue {
    const values = inputs.map(input => datePickerDefault(document!, type, input.defaultValue))
    return inputs.length === 1 ? values[0]!.value : Object.freeze([values[0]!.text, values[1]!.text] as const)
  }
  function same(left: DatePickerValue | null, right: DatePickerValue | null): boolean {
    return Array.isArray(left) && Array.isArray(right) ? left[0] === right[0] && left[1] === right[1] : left === right
  }
  function draftKey(current: DatePickerState) { return JSON.stringify([current.draft, current.badInput, current.composing]) }
  function baseline() { const current = state(); notifiedValue = current.value; notifiedDraft = draftKey(current) }
  function notify() {
    const current = state(), draft = draftKey(current)
    if (current.badInput || current.composing) {
      if (draft !== notifiedDraft) {
        notifiedDraft = draft
        root.dispatchEvent(new view!.CustomEvent("m:date-picker-draft", { detail: current }))
      }
      return
    }
    notifiedDraft = draft
    if (!same(notifiedValue, current.value)) {
      notifiedValue = current.value
      root.dispatchEvent(new view!.CustomEvent("m:change", { bubbles: true, detail: { value: current.value } }))
    }
  }
  function available(node: HTMLElement) {
    if (!node.isConnected || node.matches(":disabled") || node.closest("[hidden], [inert]")) return false
    for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
      const style = view!.getComputedStyle(parent)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function editable() { return inputs.every(input => available(input) && !input.readOnly) }
  function hasEntry() { return inputs.some(input => input.value !== "" || input.validity.badInput) }
  function synchronize() {
    anatomy()
    const previous = document!.activeElement, current = state()
    for (const item of attributes) {
      if (item.node === clearButton && item.name === "hidden") write(item, clearable && hasEntry() ? item.base : item.base ?? "")
      else if (item.name === "disabled") write(item, editable() && hasEntry() ? item.base : item.base ?? "")
      else write(item, item.base)
    }
    if (output) {
      if (output.textContent !== outputLast) outputBefore = output.textContent ?? ""
      const values = inputs.map(input => input.value)
      const text = inputs.length === 1 ? values[0] || "No value selected."
        : `Start: ${values[0] || "(empty)"}; End: ${values[1] || "(empty)"}.${current.ordered === false ? " End precedes start." : ""}`
      const displayed = `${text}${current.badInput ? " Native entry is incomplete or invalid." : ""}`
      if (output.textContent !== displayed) output.textContent = displayed
      outputLast = displayed
    }
    return clearButton && previous === clearButton && !available(clearButton) ? previous : null
  }
  function recover(previous: Element | null) {
    if (connected && clearButton && previous === clearButton && !available(clearButton)
      && (document!.activeElement === clearButton || document!.activeElement === document!.body)) {
      const input = inputs.find(input => available(input))
      if (input) input.focus({ preventScroll: true })
      else if (document!.activeElement === clearButton) clearButton.blur()
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    automatic(refresh)
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (connected) observer.observe(document!, { childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["type", "value", "min", "max", "step", "required", "readonly", "disabled", "hidden", "inert", "form", "id", "role",
        "aria-label", "aria-labelledby", "aria-live", "class", "style", "tabindex", "pattern", "contenteditable", "data-date-control", "data-date-clear", "data-date-output", "data-date-picker"] })
  }
  function report(reason: unknown) {
    error = reason
    root.dispatchEvent(new view!.CustomEvent("m:date-picker-error", { detail: { error: reason } }))
  }
  function automatic(action: () => void) {
    try { action() }
    catch (reason) { if (error !== reason) { disconnect(); report(reason) } }
  }
  function settleReset() {
    if (!reset || reset.eventPhase !== 0) return
    const previous = reset; reset = null
    if (!previous.defaultPrevented) { generation++; composing.clear(); baseline() }
  }
  function refresh() {
    if (!connected) return
    settleReset()
    mark(observer.takeRecords())
    prepareTemporalActionFocus(clearButton, inputs,
      !clearable || !hasEntry() || !editable() || !!clearButton && (!available(clearButton) || attributes.some(item => item.node === clearButton && item.base !== null)), available)
    if (!connected) return
    pause()
    let previous: Element | null = null
    try { anatomy(); applyProfile(); previous = synchronize(); error = null }
    catch (reason) { disconnect(); report(reason); throw reason }
    finally { observe() }
    if (connected) recover(previous)
  }
  function ensure() {
    if (!connected) throw new Error("Date Picker is disconnected.")
    settleReset()
    anatomy()
  }
  function setValue(value: DatePickerValue) {
    const checked = datePickerValues(document!, type, inputs.length === 2, value)
    if (connected) ensure()
    else anatomy(false)
    generation++; composing.clear()
    const before = inputs.map(input => input.value)
    inputs.forEach((input, index) => { input.value = checked[index]!.text })
    if (inputs.some((input, index) => input.value !== checked[index]!.text)) {
      inputs.forEach((input, index) => { input.value = before[index]! })
      throw new Error("Native temporal serialization changed unexpectedly; values restored.")
    }
    baseline()
    refresh()
  }
  function setDefaultValue(value: DatePickerValue) {
    const checked = datePickerValues(document!, type, inputs.length === 2, value)
    if (connected) ensure()
    else anatomy(false)
    generation++
    inputs.forEach((input, index) => { input.defaultValue = checked[index]!.text })
    baseline()
    refresh()
  }
  function setClearable(value: boolean) {
    if (typeof value !== "boolean") throw new TypeError("clearable must be boolean.")
    clearable = value
    refresh()
  }
  function configure(configuration: DatePickerConfiguration) {
    const next = profile(configuration.type)
    const values = datePickerValues(document!, next, inputs.length === 2, configuration.value)
    const defaults = datePickerValues(document!, next, inputs.length === 2, configuration.defaultValue)
    if (connected) ensure()
    else anatomy(false)
    constraints(next)
    pause(); restoreProfile(); type = next; generation++; composing.clear()
    inputs.forEach((input, index) => {
      input.type = datePickerInputType(next)
      input.defaultValue = defaults[index]!.text
      input.value = values[index]!.text
    })
    if (connected) applyProfile()
    baseline(); observe(); refresh()
  }
  function clear() {
    ensure()
    if (!editable() || !hasEntry()) return false
    const changed = inputs.filter(input => input.value !== "" || input.validity.badInput)
    inputs.forEach(input => { input.value = "" })
    const version = ++generation; composing.clear()
    refresh()
    for (const input of changed) {
      settleReset()
      if (!connected || generation !== version || inputs.some(input => input.value !== "")) break
      const event = new view!.Event("input", { bubbles: true, composed: true }); generated.add(event); input.dispatchEvent(event)
      settleReset()
      if (!connected || generation !== version || inputs.some(input => input.value !== "")) break
      const commit = new view!.Event("change", { bubbles: true }); generated.add(commit); input.dispatchEvent(commit)
    }
    settleReset()
    if (connected && generation === version && inputs.every(input => input.value === "")) root.dispatchEvent(new view!.CustomEvent("m:date-picker-clear", { detail: { value: state().value } }))
    return true
  }
  function listen(node: EventTarget, type: string, callback: EventListener, capture = false) {
    node.addEventListener(type, callback, capture); removers.push(() => node.removeEventListener(type, callback, capture))
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => { tasks.delete(id); if (connected) callback() }, 0); tasks.add(id)
  }
  function disconnect() {
    if (!connected) return
    const previous = document!.activeElement
    pause(); connected = false; generation++; reset = null; composing.clear()
    removers.splice(0).forEach(remove => remove()); tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    if (output?.textContent === outputLast) output.textContent = outputBefore
    restoreProfile()
    for (const node of nodes) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
    if (clearButton && previous === clearButton && !available(clearButton)
      && (document!.activeElement === clearButton || document!.activeElement === document!.body)) inputs.find(input => available(input))?.focus({ preventScroll: true })
  }
  function connect() {
    if (connected) { refresh(); return }
    anatomy()
    for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Date Picker node already has an owner.")
    if (clearButton && !clearButton.hidden || output && !output.hidden) throw new TypeError("Keep custom clear/readout hidden for usable native no-JS fallback.")
    for (const item of attributes) {
      item.before = item.last = item.node.getAttribute(item.name)
      item.base = item.name === "hidden" ? null : item.before
    }
    outputBefore = outputLast = output?.textContent ?? ""
    if (initializing) {
      if (initialDefaults) inputs.forEach((input, index) => { input.defaultValue = initialDefaults[index]!.text })
      if (initialValues) inputs.forEach((input, index) => { input.value = initialValues[index]!.text })
      initializing = false
    }
    connected = true; generation++; error = null; baseline()
    for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
    for (const input of inputs) {
      listen(input, "compositionstart", () => { composing.add(input); generation++ })
      listen(input, "compositionend", () => automatic(() => { composing.delete(input); generation++; refresh(); if (connected) notify() }))
      for (const event of ["input", "change"]) listen(input, event, source => automatic(() => {
        settleReset()
        if (!generated.has(source)) {
          generation++
          if (source instanceof view!.InputEvent && source.isComposing) composing.add(input)
          refresh()
        }
        if (connected) notify()
      }))
    }
    if (clearButton) listen(clearButton, "click", event => {
      const values = inputs.map(input => input.value), version = generation
      later(() => automatic(() => {
        settleReset()
        if (event.defaultPrevented || !clearable || !available(clearButton) || generation !== version || inputs.some((input, index) => input.value !== values[index])) return
        clear()
      }))
    })
    listen(document!, "reset", event => {
      if (event.target !== inputs[0]!.form) return
      settleReset(); reset = event
      later(() => automatic(() => { settleReset(); if (!event.defaultPrevented) refresh() }))
    }, true)
    refresh()
  }
  const api: DatePickerController = { inputs, get type() { return type }, get connected() { return connected }, get value() { if (connected) ensure(); else anatomy(false); return state().value },
    get defaultValue() { return defaults() }, get state() { if (connected) ensure(); else anatomy(false); return state() }, get error() { return error },
    setValue, setDefaultValue, setClearable, configure, clear, refresh, connect, disconnect }
  try { connect() } catch (reason) { disconnect(); throw reason }
  return api
}
