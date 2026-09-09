export interface InputNumberState {
  value: number | null
  text: string
  empty: boolean
  badInput: boolean
  valid: boolean
  valueMissing: boolean
  rangeUnderflow: boolean
  rangeOverflow: boolean
  stepMismatch: boolean
  canIncrement: boolean
  canDecrement: boolean
  stepError: string | null
}
export interface InputNumberController {
  readonly control: HTMLInputElement
  readonly connected: boolean
  readonly error: string | null
  readonly state: InputNumberState
  setValue(value: number | null): void
  step(direction: 1 | -1): boolean
  clear(): boolean
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.input-number.owner")
type Owned = Element & { [owner]?: InputNumberController }
interface Attribute { node: Element; name: string; before: string | null; base: string | null; last: string | null }

/** Uses native number stepping, never arithmetic or a second text/number model. */
export function createInputNumber(root: HTMLElement): InputNumberController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement)) throw new TypeError("InputNumber needs an authored root.")
  if ((root as Owned)[owner]) throw new Error("InputNumber root already has an owner.")
  const own = (node: Element) => node.closest("[data-input-number]") === root
  function one(selector: string, required = false): HTMLElement | null {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`InputNumber needs ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const field = one("[data-number-control]", true)
  if (!(field instanceof view.HTMLInputElement)) throw new TypeError("InputNumber needs a native input.")
  const control = field
  const decrement = one("[data-number-decrement]") as HTMLButtonElement | null
  const increment = one("[data-number-increment]") as HTMLButtonElement | null
  const clearButton = one("[data-number-clear]") as HTMLButtonElement | null
  if ((control as Owned)[owner]) throw new Error("Native number input already has an owner.")
  function validate() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-input-number[data-input-number]")
      || root.hasAttribute("role") || root.hasAttribute("tabindex") || root.closest("label, button, a[href], summary")
      || [control, decrement, increment, clearButton].some(node => node && (!root.contains(node) || !own(node)))
      || !control.hasAttribute("data-number-control") || [...root.querySelectorAll("[data-number-control]")].filter(own).length !== 1
      || control.type !== "number" || control.hasAttribute("role")
      || ![...control.labels ?? []].some(label => label.textContent?.trim())) {
      throw new TypeError("Keep a labelled native input[type=number] in its connected light-DOM root, with no replacement roles or interactive wrappers.")
    }
    for (const button of [decrement, increment, clearButton]) if (button && (!(button instanceof view!.HTMLButtonElement)
      || button.getAttribute("type")?.toLowerCase() !== "button"
      || !(button.getAttribute("aria-label")?.trim() || button.textContent?.trim())
      || button.hasAttribute("role") || button.getAttribute("aria-hidden") === "true"
      || button.hasAttribute("popovertarget") || button.hasAttribute("commandfor")
      || button.parentElement?.closest("label, button, a[href], summary")
      || button.querySelector("button, input, select, textarea, a[href], [tabindex], [contenteditable], [role]"))) {
      throw new TypeError("Number actions need named native type=button controls, outside labels and other interaction.")
    }
  }
  validate()
  // This private native probe is never inserted, named or form-associated. Copy the value
  // ATTRIBUTE as well as current value: it can be the native step-grid base when min is absent.
  const probe = document!.createElement("input")
  probe.type = "number"
  let connected = true, composing = false, error: string | null = null
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>()
  function number() { const value = control.valueAsNumber; return Number.isFinite(value) ? value : null }
  function editable() {
    return connected && control.isConnected && control.type === "number" && !composing && !control.readOnly
      && !control.matches(":disabled") && control.getAttribute("aria-disabled") !== "true"
      && control.getAttribute("aria-readonly") !== "true" && !control.closest("[hidden], [inert]")
  }
  function candidate(direction: 1 | -1): { available: boolean; error: unknown | null } {
    if (composing || control.validity.badInput) return { available: false, error: null }
    for (const name of ["min", "max", "step", "value"]) {
      const value = control.getAttribute(name)
      if (value === null) probe.removeAttribute(name)
      else probe.setAttribute(name, value)
    }
    probe.value = control.value
    try {
      if (direction === 1) probe.stepUp()
      else probe.stepDown()
    } catch (reason) { return { available: false, error: reason } }
    if (!Number.isFinite(probe.valueAsNumber)) return { available: false, error: new RangeError("Native stepping did not produce a finite number.") }
    return { available: probe.valueAsNumber !== number(), error: null }
  }
  function state(): InputNumberState {
    const up = candidate(1), down = candidate(-1), validity = control.validity
    const reason = up.error ?? down.error
    return {
      value: number(), text: control.value, empty: control.value === "" && !validity.badInput,
      badInput: validity.badInput, valid: validity.valid, valueMissing: validity.valueMissing,
      rangeUnderflow: validity.rangeUnderflow, rangeOverflow: validity.rangeOverflow, stepMismatch: validity.stepMismatch,
      canIncrement: editable() && up.available, canDecrement: editable() && down.available,
      stepError: reason instanceof Error ? `${reason.name}: ${reason.message}` : reason === null ? null : String(reason),
    }
  }
  function lease(node: Element, name: string, enhancement = false) {
    const before = node.getAttribute(name), item = { node, name, before, base: enhancement ? null : before, last: before }
    attributes.push(item); return item
  }
  for (const button of [decrement, increment, clearButton]) if (button) { lease(button, "hidden", true); lease(button, "disabled") }
  const attr = (node: Element, name: string) => attributes.find(item => item.node === node && item.name === name)!
  function write(item: Attribute, value: string | null) {
    if (item.node.getAttribute(item.name) !== value) {
      if (value === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, value)
    }
    item.last = value
  }
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const item = attributes.find(item => item.node === record.target && item.name === record.attributeName)
      if (item) item.before = item.base = item.last = item.node.getAttribute(item.name)
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    if (!root.isConnected || root.getRootNode() !== document || !root.contains(control)) { disconnect(); return }
    attemptRefresh()
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, attributes: true,
      attributeFilter: ["disabled", "readonly", "type", "role", "hidden", "min", "max", "step", "value", "required", "form", "aria-disabled", "aria-readonly"] })
    for (let node = root.parentElement; node; node = node.parentElement) observer.observe(node, { childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"] })
  }
  function refresh() {
    if (!connected) return
    pause()
    try {
      validate(); error = null
      const current = state()
      for (const button of [decrement, increment, clearButton]) if (button) {
        const hidden = attr(button, "hidden"), disabled = attr(button, "disabled")
        const hide = hidden.base !== null || button === clearButton && current.empty
        const available = button === decrement ? current.canDecrement : button === increment ? current.canIncrement : editable()
        if ((hide || !available || disabled.base !== null) && document!.activeElement === button
          && !control.matches(":disabled") && !control.closest("[hidden], [inert]")) {
          control.focus({ preventScroll: true }); if (!connected) return
        }
        write(hidden, hide ? hidden.base ?? "" : null)
        write(disabled, available ? disabled.base : disabled.base ?? "")
      }
    } catch (reason) { error = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally { observe() }
  }
  function report(reason: unknown, previous: string | null) {
    error = reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason)
    if (previous !== error) root.dispatchEvent(new view!.CustomEvent("mui:input-number-error", { detail: { message: error } }))
  }
  function attemptRefresh() { const previous = error; try { refresh() } catch (reason) { report(reason, previous) } }
  function notify() {
    control.dispatchEvent(new view!.Event("input", { bubbles: true, composed: true }))
    control.dispatchEvent(new view!.Event("change", { bubbles: true }))
  }
  function setValue(value: number | null) {
    if (!connected) throw new Error("InputNumber is disconnected.")
    if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) throw new TypeError("setValue requires a finite number or null, not a formatted string.")
    if (composing) throw new view!.DOMException("Do not replace a composing native draft.", "InvalidStateError")
    refresh()
    if (value === null) control.value = ""
    else control.valueAsNumber = value
    refresh()
  }
  function step(direction: 1 | -1) {
    if (direction !== 1 && direction !== -1) throw new TypeError("step direction must be 1 or -1.")
    refresh()
    if (!editable() || control.validity.badInput) return false
    const next = candidate(direction)
    if (next.error) throw next.error
    if (!next.available) return false
    const before = number()
    if (direction === 1) control.stepUp()
    else control.stepDown()
    refresh()
    if (number() === before) return false
    if (connected) notify()
    return true
  }
  function clear() {
    refresh()
    if (!editable() || control.value === "" && !control.validity.badInput) return false
    const previous = { value: number(), text: control.value, badInput: control.validity.badInput }
    if (document!.activeElement === clearButton) control.focus({ preventScroll: true })
    if (!editable()) return false
    control.value = ""; refresh()
    if (connected) {
      notify()
      control.dispatchEvent(new view!.CustomEvent("mui:input-number-clear", { bubbles: true, detail: { previous } }))
    }
    return true
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => { tasks.delete(id); if (connected) callback() }, 0); tasks.add(id)
  }
  function listen(node: EventTarget, type: string, callback: EventListener, capture = false) {
    node.addEventListener(type, callback, capture); removers.push(() => node.removeEventListener(type, callback, capture))
  }
  function disconnect() {
    if (!connected) return
    pause(); connected = false
    removers.splice(0).forEach(remove => remove())
    tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    const active = document!.activeElement
    if ([decrement, increment, clearButton].some(button => button && button === active && attr(button, "hidden").before !== null)
      && control.isConnected && !control.matches(":disabled") && !control.closest("[hidden], [inert]")) control.focus({ preventScroll: true })
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    for (const node of [root, control] as Owned[]) if (node[owner] === controller) delete node[owner]
  }
  const controller: InputNumberController = {
    control, get connected() { return connected }, get error() { return error },
    get state() { if (!connected) throw new Error("InputNumber is disconnected."); validate(); return state() },
    setValue, step, clear, refresh, disconnect,
  }
  for (const node of [root, control]) Object.defineProperty(node, owner, { value: controller, configurable: true })
  listen(control, "input", attemptRefresh); listen(control, "change", attemptRefresh)
  listen(control, "compositionstart", () => { composing = true; attemptRefresh() })
  listen(control, "compositionend", () => { composing = false; attemptRefresh() })
  for (const button of [decrement, increment, clearButton]) if (button) listen(button, "click", event => later(() => {
    if (event.defaultPrevented || button.disabled || button.hidden || button.matches(":disabled")) return
    const previous = error
    try { if (button === clearButton) clear(); else step(button === increment ? 1 : -1) }
    catch (reason) { report(reason, previous) }
  }))
  listen(document!, "reset", event => {
    if (event.target === control.form) later(() => { if (!event.defaultPrevented) composing = false; attemptRefresh() })
  }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return controller
}
