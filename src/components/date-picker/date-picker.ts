import { isDatePickerTypeSupported, nativeDateValue } from "./native.js"
import type { NativeDateType } from "./native.js"

export type DatePickerValue = string | readonly [string, string]
export interface DatePickerState {
  readonly value: DatePickerValue
  readonly empty: boolean
  readonly partial: boolean
  readonly complete: boolean
  readonly ordered: boolean | null
  readonly nativeValid: boolean
  readonly badInput: boolean
}
export interface DatePickerController {
  readonly inputs: readonly HTMLInputElement[]
  readonly type: NativeDateType
  readonly connected: boolean
  readonly value: DatePickerValue
  readonly state: DatePickerState
  readonly error: unknown
  setValue(value: DatePickerValue): void
  clear(): boolean
  refresh(): void
  disconnect(): void
}
interface Attribute { node: HTMLElement; name: string; before: string | null; base: string | null; last: string | null }
const owner = Symbol.for("markup-ui.date-picker.owner")
type Owned = Element & { [owner]?: DatePickerController }

/** Native calendar/wall-clock fields, never epoch conversion, calendar rendering or linked-bound mutation. */
export function createDatePicker(root: HTMLElement): DatePickerController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches("[data-date-picker]")) throw new TypeError("Date Picker needs an authored data-date-picker root.")
  const own = (node: Element) => node.closest("[data-date-picker]") === root
  const fields = [...root.querySelectorAll("[data-date-control]")].filter(own)
  if (fields.length < 1 || fields.length > 2 || fields.some(field => !(field instanceof view.HTMLInputElement))) throw new TypeError("Author one native input or exactly two same-mode range endpoints.")
  const inputs = Object.freeze(fields as HTMLInputElement[])
  const type = inputs[0]!.getAttribute("type")?.toLowerCase() as NativeDateType
  if (!isDatePickerTypeSupported(document!, type)) throw new TypeError("Use a supported native date, month, week or datetime-local mode; no calendar/text polyfill is installed.")
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
    return !!(input.getAttribute("aria-label")?.trim() || [...input.labels ?? []].some(label => label.textContent?.trim()))
  }
  function anatomy() {
    const current = [...root.querySelectorAll("[data-date-control]")].filter(own)
    if (!root.isConnected || root.getRootNode() !== document || root.closest("label, button, a[href], summary")
      || current.length !== inputs.length || current.some((node, index) => node !== inputs[index])
      || one("[data-date-clear]") !== clearButton || one("[data-date-output]") !== output
      || nodes.some(node => node !== root && (!root.contains(node) || !own(node)))
      || inputs.some(input => input.type !== type || input.getAttribute("type")?.toLowerCase() !== type || !named(input)
        || input.hasAttribute("role") || input.hidden || input.form !== inputs[0]!.form)) throw new TypeError("Keep original labelled same-mode endpoints, their order and actual common form owner.")
    for (const input of inputs) {
      nativeDateValue(document!, type, input.value)
      if (input.hasAttribute("value")) nativeDateValue(document!, type, input.defaultValue)
    }
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
  let connected = true, generation = 0, error: unknown = null
  let reset: Event | null = null
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>(), generated = new WeakSet<Event>()
  let outputBefore = output?.textContent ?? "", outputLast = outputBefore
  function lease(node: HTMLElement, name: string, enhance = false) {
    const before = node.getAttribute(name)
    attributes.push({ node, name, before, base: enhance ? null : before, last: before })
  }
  if (clearButton) { lease(clearButton, "hidden", true); lease(clearButton, "disabled") }
  if (output) lease(output, "hidden", true)
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const item = attributes.find(item => item.node === record.target && item.name === record.attributeName)
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
  function state(): DatePickerState {
    const values = inputs.map(input => input.value), parsed = values.map(value => nativeDateValue(document!, type, value))
    const badInput = inputs.some(input => input.validity.badInput), count = values.filter(Boolean).length
    const complete = count === inputs.length && !badInput
    return Object.freeze({
      value: inputs.length === 1 ? values[0]! : Object.freeze([values[0]!, values[1]!] as const),
      empty: count === 0 && !badInput,
      partial: badInput || count > 0 && count < inputs.length,
      complete,
      ordered: inputs.length === 2 && complete ? parsed[0]!.coordinate! <= parsed[1]!.coordinate! : null,
      nativeValid: inputs.every(input => !input.willValidate || input.validity.valid),
      badInput,
    })
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
      if (item.node === clearButton && item.name === "hidden") write(item, hasEntry() ? item.base : item.base ?? "")
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
    try { refresh() } catch { /* refresh reports unsupported anatomy without altering native values. */ }
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (connected) observer.observe(document!, { childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["type", "value", "min", "max", "step", "required", "readonly", "disabled", "hidden", "inert", "form", "id", "role",
        "aria-label", "aria-live", "class", "style", "tabindex", "contenteditable", "data-date-control", "data-date-clear", "data-date-output", "data-date-picker"] })
  }
  function report(reason: unknown) {
    error = reason
    root.dispatchEvent(new view!.CustomEvent("mui:date-picker-error", { detail: { error: reason } }))
  }
  function settleReset() {
    if (!reset || reset.eventPhase !== 0) return
    const previous = reset; reset = null
    if (!previous.defaultPrevented) generation++
  }
  function refresh() {
    if (!connected) return
    settleReset()
    pause()
    let previous: Element | null = null
    try { previous = synchronize(); error = null }
    catch (reason) { disconnect(); report(reason); throw reason }
    finally { observe() }
    recover(previous)
  }
  function ensure() {
    if (!connected) throw new Error("Date Picker is disconnected.")
    settleReset()
    anatomy()
  }
  function setValue(value: DatePickerValue) {
    const values = inputs.length === 1
      ? typeof value === "string" ? [value] : null
      : Array.isArray(value) && value.length === 2 ? Array.from(value) : null
    if (!values) throw new TypeError("Use a string for one field or an explicit two-string tuple for a range; empty string is native empty.")
    const checked = values.map(value => nativeDateValue(document!, type, value).value)
    ensure(); generation++
    const before = inputs.map(input => input.value)
    inputs.forEach((input, index) => { input.value = checked[index]! })
    if (inputs.some((input, index) => input.value !== checked[index])) {
      inputs.forEach((input, index) => { input.value = before[index]! })
      throw new Error("Native temporal serialization changed unexpectedly; values restored.")
    }
    refresh()
  }
  function clear() {
    ensure()
    if (!editable() || !hasEntry()) return false
    const changed = inputs.filter(input => input.value !== "" || input.validity.badInput)
    inputs.forEach(input => { input.value = "" })
    const version = ++generation
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
    if (connected && generation === version && inputs.every(input => input.value === "")) root.dispatchEvent(new view!.CustomEvent("mui:date-picker-clear", { detail: { value: state().value } }))
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
    pause(); connected = false; generation++; reset = null
    removers.splice(0).forEach(remove => remove()); tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    if (output?.textContent === outputLast) output.textContent = outputBefore
    for (const node of nodes) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
    if (clearButton && previous === clearButton && !available(clearButton)
      && (document!.activeElement === clearButton || document!.activeElement === document!.body)) inputs.find(input => available(input))?.focus({ preventScroll: true })
  }
  const api: DatePickerController = { inputs, type, get connected() { return connected }, get value() { ensure(); return state().value },
    get state() { ensure(); return state() }, get error() { return error }, setValue, clear, refresh, disconnect }
  for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
  for (const input of inputs) for (const event of ["input", "change"]) listen(input, event, source => {
    if (!generated.has(source)) { generation++; try { refresh() } catch { /* Explicit component error. */ } }
  })
  if (clearButton) listen(clearButton, "click", event => {
    const values = inputs.map(input => input.value), version = generation
    later(() => {
      settleReset()
      if (event.defaultPrevented || !available(clearButton) || generation !== version || inputs.some((input, index) => input.value !== values[index])) return
      try { clear() } catch (reason) { if (error !== reason) report(reason) }
    })
  })
  listen(document!, "reset", event => {
    if (event.target !== inputs[0]!.form) return
    settleReset(); reset = event
    later(() => { settleReset(); if (!event.defaultPrevented) { try { refresh() } catch { /* Explicit component error. */ } } })
  }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return api
}
