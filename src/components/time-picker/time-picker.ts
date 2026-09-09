import { isTimePickerSupported, nativeTimeValue } from "./native.js"
import { prepareTemporalActionFocus } from "../temporal/focus.js"

export interface TimePickerState {
  readonly value: string
  readonly empty: boolean
  readonly badInput: boolean
  readonly nativeValid: boolean
}
export interface TimePickerController {
  readonly control: HTMLInputElement
  readonly value: string
  readonly state: TimePickerState
  readonly connected: boolean
  readonly error: unknown
  setValue(value: string): void
  clear(): boolean
  refresh(): void
  disconnect(): void
}
interface Attribute { node: HTMLElement; name: string; before: string | null; base: string | null; last: string | null }
const owner = Symbol.for("markup-ui.time-picker.owner")
type Owned = Element & { [owner]?: TimePickerController }

/** A time-of-day input is not an anchored date/instant; all native min/max/step behavior stays native. */
export function createTimePicker(root: HTMLElement): TimePickerController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches("[data-time-picker]")) throw new TypeError("Time Picker needs an authored data-time-picker root.")
  const own = (node: Element) => node.closest("[data-time-picker]") === root
  function one(selector: string, required = false) {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} owned ${selector}.`)
    return nodes[0] ?? null
  }
  const field = one("[data-time-control]", true), clearNode = one("[data-time-clear]"), output = one("[data-time-output]")
  if (!(field instanceof view.HTMLInputElement) || clearNode && !(clearNode instanceof view.HTMLButtonElement)
    || !isTimePickerSupported(document!)) throw new TypeError("Use one supported native time input; no range, date anchor or panel polyfill is installed.")
  const control = field, clearButton = clearNode as HTMLButtonElement | null
  const nodes = [root, control, ...[clearButton, output].filter((node): node is HTMLElement => !!node)]
  if (new Set(nodes).size !== nodes.length) throw new TypeError("Time field, readout and clear action must be distinct.")
  for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Time Picker node already has an owner.")
  function anatomy() {
    if (!root.isConnected || root.getRootNode() !== document || root.closest("label, button, a[href], summary")
      || one("[data-time-control]", true) !== control || one("[data-time-clear]") !== clearButton || one("[data-time-output]") !== output
      || nodes.some(node => node !== root && (!root.contains(node) || !own(node)))
      || control.type !== "time" || control.getAttribute("type")?.toLowerCase() !== "time" || control.hasAttribute("role") || control.hidden
      || !(control.getAttribute("aria-label")?.trim() || [...control.labels ?? []].some(label => label.textContent?.trim()))) throw new TypeError("Keep the original connected labelled native time field and mapped anatomy.")
    nativeTimeValue(document!, control.value)
    if (control.hasAttribute("value")) nativeTimeValue(document!, control.defaultValue)
    if (clearButton && (clearButton.getAttribute("type")?.toLowerCase() !== "button"
      || !(clearButton.getAttribute("aria-label")?.trim() || clearButton.textContent?.trim())
      || clearButton.hasAttribute("role") || clearButton.getAttribute("aria-hidden") === "true" || clearButton.hasAttribute("popovertarget") || clearButton.hasAttribute("commandfor")
      || clearButton.parentElement?.closest("label, button, a[href], summary")
      || clearButton.querySelector("input, button, select, textarea, a[href], [tabindex], [contenteditable], [role]"))) throw new TypeError("Use a separate labelled native type=button clear action.")
    if (output && (!["span", "p"].includes(output.localName) || output.children.length || output.hasAttribute("role") || output.hasAttribute("aria-live")
      || output.hasAttribute("tabindex") || output.isContentEditable
      || output.closest('label, button, a[href], [aria-live]:not([aria-live="off" i]), [role~="alert" i], [role~="status" i], [role~="log" i]'))) throw new TypeError("Use separate plain nonlive time readout text.")
  }
  anatomy()
  if (clearButton && !clearButton.hidden || output && !output.hidden) throw new TypeError("Custom clear/readout start hidden for native no-JS fallback.")
  let connected = true, generation = 0, error: unknown = null, reset: Event | null = null
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
  function available(node: HTMLElement) {
    if (!node.isConnected || node.matches(":disabled") || node.closest("[hidden], [inert]")) return false
    for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
      const style = view!.getComputedStyle(parent)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function hasEntry() { return control.value !== "" || control.validity.badInput }
  function editable() { return available(control) && !control.readOnly }
  function state(): TimePickerState {
    return Object.freeze({ value: control.value, empty: !hasEntry(), badInput: control.validity.badInput,
      nativeValid: !control.willValidate || control.validity.valid })
  }
  function synchronize() {
    anatomy()
    const previous = document!.activeElement
    for (const item of attributes) {
      if (item.node === clearButton && item.name === "hidden") write(item, hasEntry() ? item.base : item.base ?? "")
      else if (item.name === "disabled") write(item, editable() && hasEntry() ? item.base : item.base ?? "")
      else write(item, item.base)
    }
    if (output) {
      if (output.textContent !== outputLast) outputBefore = output.textContent ?? ""
      const text = `${control.value || "No time selected."}${control.validity.badInput ? " Native entry is incomplete or invalid." : ""}`
      if (output.textContent !== text) output.textContent = text
      outputLast = text
    }
    return clearButton && previous === clearButton && !available(clearButton) ? previous : null
  }
  function recover(previous: Element | null) {
    if (clearButton && previous === clearButton && !available(clearButton)
      && (document!.activeElement === clearButton || document!.activeElement === document!.body)) {
      if (available(control)) control.focus({ preventScroll: true })
      else if (document!.activeElement === clearButton) clearButton.blur()
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records); try { refresh() } catch { /* refresh reports and withdraws unsupported enhancement. */ }
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (connected) observer.observe(document!, { childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["type", "value", "min", "max", "step", "required", "readonly", "disabled", "hidden", "inert", "form", "id", "role",
        "aria-label", "aria-live", "class", "style", "tabindex", "contenteditable", "data-time-control", "data-time-clear", "data-time-output", "data-time-picker"] })
  }
  function report(reason: unknown) {
    error = reason
    root.dispatchEvent(new view!.CustomEvent("mui:time-picker-error", { detail: { error: reason } }))
  }
  function settleReset() {
    if (!reset || reset.eventPhase !== 0) return
    const previous = reset; reset = null
    if (!previous.defaultPrevented) generation++
  }
  function refresh() {
    if (!connected) return
    settleReset()
    mark(observer.takeRecords())
    prepareTemporalActionFocus(clearButton, [control],
      !hasEntry() || !editable() || !!clearButton && (!available(clearButton) || attributes.some(item => item.node === clearButton && item.base !== null)), available)
    if (!connected) return
    pause()
    let previous: Element | null = null
    try { previous = synchronize(); error = null }
    catch (reason) { disconnect(); report(reason); throw reason }
    finally { observe() }
    if (connected) recover(previous)
  }
  function ensure() {
    if (!connected) throw new Error("Time Picker is disconnected.")
    settleReset(); anatomy()
  }
  function setValue(value: string) {
    const checked = nativeTimeValue(document!, value)
    ensure(); generation++
    const previous = control.value
    control.value = checked
    if (control.value !== checked) { control.value = previous; throw new Error("Native time serialization changed unexpectedly; value restored.") }
    refresh()
  }
  function clear() {
    ensure()
    if (!editable() || !hasEntry()) return false
    control.value = ""; const version = ++generation
    refresh()
    if (connected && generation === version && control.value === "") {
      const input = new view!.Event("input", { bubbles: true, composed: true }); generated.add(input); control.dispatchEvent(input)
      settleReset()
      if (connected && generation === version && control.value === "") {
        const change = new view!.Event("change", { bubbles: true }); generated.add(change); control.dispatchEvent(change)
      }
      settleReset()
      if (connected && generation === version && control.value === "") root.dispatchEvent(new view!.CustomEvent("mui:time-picker-clear", { detail: { value: "" } }))
    }
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
    recover(previous)
  }
  const api: TimePickerController = { control, get value() { ensure(); return control.value }, get state() { ensure(); return state() },
    get connected() { return connected }, get error() { return error }, setValue, clear, refresh, disconnect }
  for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
  for (const type of ["input", "change"]) listen(control, type, event => {
    if (!generated.has(event)) { generation++; try { refresh() } catch { /* Explicit component error. */ } }
  })
  if (clearButton) listen(clearButton, "click", event => {
    const value = control.value, version = generation
    later(() => {
      settleReset()
      if (event.defaultPrevented || !available(clearButton) || generation !== version || control.value !== value) return
      try { clear() } catch (reason) { if (error !== reason) report(reason) }
    })
  })
  listen(document!, "reset", event => {
    if (event.target !== control.form) return
    settleReset(); reset = event
    later(() => { settleReset(); if (!event.defaultPrevented) { try { refresh() } catch { /* Explicit component error. */ } } })
  }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return api
}
