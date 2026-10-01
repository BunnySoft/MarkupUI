export type SliderValue = number | readonly [number, number]
export type SliderDefaultValue = string | readonly [string, string]
export type SliderStep = number | "any"
export interface SliderOptions { formatValue?: (value: number, index: number) => string }
interface SliderLifetime {
  readonly connected: boolean
  readonly error: string | null
  setMin(value: number | null): void
  setMax(value: number | null): void
  setStep(value: SliderStep | null): void
  setDisabled(value: boolean): void
  setName(value: string | null): void
  setForm(value: string | null): void
  setAccessibleName(label: string | null, labelledBy: string | null): void
  setReverse(value: boolean): void
  setVertical(value: boolean): void
  setFormatValue(value: SliderOptions["formatValue"]): void
  stepUp(n?: number, index?: number): void
  stepDown(n?: number, index?: number): void
  refresh(): void
  disconnect(): void
}
export interface SliderController extends SliderLifetime {
  readonly control: HTMLInputElement
  readonly value: number
  readonly defaultValue: string
  setValue(value: number): void
  setDefaultValue(value: string): void
}
export interface SliderPairController extends SliderLifetime {
  readonly controls: readonly [HTMLInputElement, HTMLInputElement]
  readonly value: [number, number]
  readonly defaultValue: [string, string]
  readonly ordered: boolean
  setValue(value: readonly [number, number]): void
  setDefaultValue(value: readonly [string, string]): void
}
export interface SliderPairChange { value: [number, number]; ordered: boolean; index: number }
const owner = Symbol.for("markup-ui.slider.owner")
type Owned = Element & { [owner]?: object }
interface Attribute { node: Element; name: string; before: string | null; base: string | null; last: string | null }
interface Readout { node: HTMLOutputElement; control: HTMLInputElement; before: string; last: string }

/** @internal */
export function sliderNumbers(value: unknown, count: 1 | 2): number[] {
  const values = count === 1 ? [value] : value
  if (!Array.isArray(values) || values.length !== count
    || values.some(item => typeof item !== "number" || !Number.isFinite(item))) {
    throw new RangeError(`Slider needs ${count} finite number${count === 2 ? "s" : ""}; range inputs have no null/empty state.`)
  }
  return [...values]
}

/** @internal */
export function sliderValueAttribute(value: string | null, count: 1 | 2): SliderValue {
  if (value === null) return count === 1 ? 0 : [0, 100]
  if (!value.trim()) throw new RangeError("Invalid Slider value.")
  const numbers = sliderNumbers(count === 1 ? Number(value) : JSON.parse(value), count)
  return count === 1 ? numbers[0]! : [numbers[0]!, numbers[1]!]
}

/** @internal */
export function sliderConstraint(name: "min" | "max" | "step", value: unknown): number | "any" {
  if (name === "step" && value === "any") return value
  if (typeof value !== "number" || !Number.isFinite(value) || name === "step" && value <= 0) {
    throw new RangeError(`Invalid number ${name}.`)
  }
  return value
}

/** @internal */
export function sliderNativeConstraint(control: HTMLInputElement | undefined, name: "min" | "max" | "step"): number | "any" {
  const value = control?.getAttribute(name)
  if (name === "step" && value === "any") return value
  const number = value?.trim() ? Number(value) : NaN
  return Number.isFinite(number) && (name !== "step" || number > 0) ? number : name === "max" ? 100 : name === "step" ? 1 : 0
}

/** @internal */
export function createSliderControl(document: Document, index: number, count: 1 | 2, value: string | null): HTMLInputElement {
  const control = document.createElement("input")
  control.type = "range"
  control.setAttribute("data-slider-control", "")
  control.min = "0"; control.max = "100"; control.step = "1"
  const numbers = sliderNumbers(sliderValueAttribute(value, count), count)
  control.defaultValue = String(numbers[index]!)
  control.setAttribute("aria-label", count === 1 ? "Slider" : index === 0 ? "Start" : "End")
  return control
}

function bind(root: HTMLElement, count: 1 | 2, options: SliderOptions) {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement)) throw new TypeError("Slider needs an authored root.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => key !== "formatValue")
    || options.formatValue !== undefined && typeof options.formatValue !== "function") throw new TypeError("Slider accepts only a plain-string formatValue callback.")
  if ((root as Owned)[owner]) throw new Error("Slider root already has an owner.")
  let formatValue = options.formatValue
  const token = {}, boundary = "[data-slider], [data-slider-pair], m-slider"
  const eventRoot = count === 2 && root.parentElement?.localName === "m-slider" ? root.parentElement : root
  const own = (node: Element) => node.closest(boundary) === root
  const nodes = [...root.querySelectorAll("[data-slider-control]")].filter(own)
  if (nodes.length !== count || nodes.some(node => !(node instanceof view.HTMLInputElement))) {
    throw new TypeError(`Author exactly ${count} native slider input${count === 2 ? "s" : ""}.`)
  }
  const controls = nodes as HTMLInputElement[]
  const readouts: Readout[] = []
  for (const node of [...root.querySelectorAll("[data-slider-output]")].filter(own)) {
    if (!(node instanceof view.HTMLOutputElement) || node.htmlFor.length !== 1 || node.children.length
      || node.getAttribute("aria-live") !== "off" || node.hasAttribute("role") || node.hasAttribute("tabindex")) {
      throw new TypeError("Slider readouts need text-only output[for][aria-live=off], with no extra role/tabstop.")
    }
    const control = controls.find(control => !!control.id && node.htmlFor.contains(control.id))
    if (!control || readouts.some(item => item.control === control)) throw new TypeError("Each output must reference one distinct owned slider ID.")
    readouts.push({ node, control, before: node.value, last: node.value })
  }
  function validate() {
    if (!root.isConnected || root.getRootNode() !== document
      || !root.matches(count === 1 ? ".m-slider[data-slider]" : "fieldset.m-slider-pair[data-slider-pair]")
      || root.hasAttribute("role") || root.hasAttribute("tabindex") || root.closest("label, button, a[href], summary")
      || count === 2 && ![...root.children].find(node => node.localName === "legend")?.textContent?.trim()) {
      throw new TypeError("Keep Slider in a connected light-DOM root without a role/tabstop; pairs need a named first fieldset legend.")
    }
    const current = [...root.querySelectorAll("[data-slider-control]")].filter(own)
    if (current.length !== count || current.some((node, index) => node !== controls[index])) {
      throw new TypeError("Slider controls/order changed; disconnect and recreate the binding.")
    }
    for (const control of controls) {
      const named = [...control.labels ?? []].some(label => label.textContent?.trim())
        || !!control.getAttribute("aria-label")?.trim()
        || control.getAttribute("aria-labelledby")?.trim().split(/\s+/).some(id => document!.getElementById(id)?.textContent?.trim())
      if (control.type !== "range" || control.hasAttribute("role") || control.hasAttribute("readonly")
        || !named || !Number.isFinite(control.valueAsNumber)) {
        throw new TypeError("Use labelled native input[type=range] controls with finite native values; no replacement roles or readonly.")
      }
      if ((control as Owned)[owner] && (control as Owned)[owner] !== token) throw new Error("Native slider already has an owner.")
    }
    for (const item of readouts) if (!root.contains(item.node) || !own(item.node) || item.node.children.length
      || item.node.getAttribute("aria-live") !== "off" || !item.control.id || item.node.htmlFor.length !== 1
      || !item.node.htmlFor.contains(item.control.id)) throw new TypeError("Keep the original non-live readouts associated with their native sliders.")
  }
  validate()
  let connected = true, error: string | null = null, generation = 0
  let accepted = controls.map(control => control.valueAsNumber)
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>()
  function lease(node: Element, name: string, enhancement = false) {
    const existing = attributes.find(item => item.node === node && item.name === name)
    if (existing) return existing
    const before = node.getAttribute(name)
    const item = { node, name, before, base: enhancement ? null : before, last: before }
    attributes.push(item)
    return item
  }
  for (const item of readouts) lease(item.node, "hidden", true)
  for (const control of controls) lease(control, "aria-valuetext")
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
    if (!root.isConnected || root.getRootNode() !== document) { disconnect(); return }
    if (controls.some(node => !root.contains(node))) {
      report(new TypeError("Slider controls/order changed; disconnect and recreate the binding."))
      disconnect(); return
    }
    attemptRefresh()
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["min", "max", "step", "value", "disabled", "readonly", "type", "role", "hidden", "form",
        "for", "id", "aria-label", "aria-labelledby", "aria-valuetext", "aria-live", "data-slider-control"] })
    for (let node = root.parentElement; node; node = node.parentElement) observer.observe(node, { childList: true })
  }
  function values() {
    if (!connected) throw new Error("Slider is disconnected.")
    validate()
    return controls.map(control => control.valueAsNumber)
  }
  function report(reason: unknown) {
    const previous = error
    error = reason instanceof Error ? reason.message : String(reason)
    if (previous !== error) root.dispatchEvent(new view!.CustomEvent("m:slider-error", { detail: { message: error } }))
  }
  function transaction(update?: (copies: HTMLInputElement[]) => void, commit?: () => void, formatter = formatValue ?? null) {
    const turn = ++generation
    pause()
    try {
      values()
      const before = controls.map(control => `${control.outerHTML}\n${control.value}`)
      const anatomy = root.outerHTML
      const copies = controls.map(control => control.cloneNode(false) as HTMLInputElement)
      update?.(copies)
      const numbers = copies.map(control => control.valueAsNumber)
      const texts = copies.map((control, index) => formatter ? formatter(numbers[index]!, index) : control.value)
      if (texts.some(text => typeof text !== "string")) throw new TypeError("formatValue must return plain text, never HTML/VNodes.")
      if (!connected || turn !== generation || root.outerHTML !== anatomy
        || controls.some((control, index) => `${control.outerHTML}\n${control.value}` !== before[index])) {
        throw new Error("Slider update was superseded during formatValue.")
      }
      validate()
      commit?.()
      for (const [index, control] of controls.entries()) {
        const text = texts[index]!
        const valuetext = lease(control, "aria-valuetext")
        write(valuetext, formatter ? text : valuetext.base)
        const item = readouts.find(item => item.control === control)
        if (item) {
          if (item.node.value !== item.last) item.before = item.node.value
          item.node.value = text; item.last = text
          const hidden = lease(item.node, "hidden", true); write(hidden, hidden.base)
        }
      }
      accepted = numbers
      error = null
    } catch (reason) { report(reason); throw reason }
    finally { observe() }
  }
  function refresh() { transaction() }
  function attemptRefresh() { try { refresh() } catch (reason) { report(reason) } }
  function setValues(next: readonly number[]) {
    const numbers = sliderNumbers(count === 1 && Array.isArray(next) ? next[0] : next, count)
    transaction(copies => copies.forEach((control, index) => { control.value = String(numbers[index]!) }),
      () => controls.forEach((control, index) => { control.value = String(numbers[index]!) }))
  }
  function setDefaultValues(next: readonly string[]) {
    if (!Array.isArray(next) || next.length !== count || next.some(value => typeof value !== "string")) {
      throw new TypeError(`Slider defaults need ${count} native value string${count === 2 ? "s" : ""}.`)
    }
    transaction(copies => copies.forEach((control, index) => { control.defaultValue = next[index]! }),
      () => controls.forEach((control, index) => { control.defaultValue = next[index]! }))
  }
  function setConstraint(name: "min" | "max" | "step", value: number | "any" | null) {
    if (value !== null) sliderConstraint(name, value)
    const apply = (nodes: HTMLInputElement[]) => nodes.forEach(control => {
      if (value === null) control.removeAttribute(name)
      else control.setAttribute(name, String(value))
    })
    transaction(apply, () => apply(controls))
  }
  function map(nodes: Element[], name: string, value: string | null) {
    values()
    generation++
    pause()
    try {
      for (const node of nodes) {
        const item = lease(node, name)
        write(item, value === null ? item.base : value)
      }
    } finally { observe() }
  }
  function text(value: string | null) {
    if (value !== null && typeof value !== "string") throw new TypeError("Slider native attributes need strings or null.")
    return value
  }
  function boolean(value: boolean) {
    if (typeof value !== "boolean") throw new TypeError("Slider flags need booleans.")
    return value
  }
  function step(up: boolean, n = 1, index = 0) {
    if (!Number.isInteger(index) || index < 0 || index >= count) throw new RangeError("Slider stepping needs an owned control index.")
    const apply = (control: HTMLInputElement) => { if (up) control.stepUp(n); else control.stepDown(n) }
    transaction(copies => apply(copies[index]!), () => apply(controls[index]!))
    notify(values(), index)
  }
  function notify(current: number[], index: number) {
    const value = count === 1 ? current[0]! : [current[0]!, current[1]!] as [number, number]
    root.dispatchEvent(new view!.CustomEvent("m:change", {
      bubbles: true, detail: count === 1 ? { value } : { value, ordered: current[0]! <= current[1]!, index },
    }))
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => {
      tasks.delete(id)
      if (connected && root.isConnected && root.getRootNode() === document) callback()
    }, 0)
    tasks.add(id)
  }
  function listen(node: EventTarget, type: string, callback: EventListener, capture = false) {
    node.addEventListener(type, callback, capture); removers.push(() => node.removeEventListener(type, callback, capture))
  }
  function disconnect() {
    if (!connected) return
    pause(); connected = false; generation++
    removers.splice(0).forEach(remove => remove())
    tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    for (const item of readouts) if (item.node.value === item.last) item.node.value = item.before
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    for (const node of [root, ...controls] as Owned[]) if (node[owner] === token) delete node[owner]
  }
  const operations = {
    setMin(value: number | null) { setConstraint("min", value) },
    setMax(value: number | null) { setConstraint("max", value) },
    setStep(value: SliderStep | null) { setConstraint("step", value) },
    setDisabled(value: boolean) {
      boolean(value)
      values()
      if (count === 2) (root as HTMLFieldSetElement).disabled = value
      else controls[0]!.disabled = value
    },
    setName(value: string | null) { text(value); values(); controls.forEach(control => { if (value === null) control.removeAttribute("name"); else control.name = value }) },
    setForm(value: string | null) { text(value); values(); controls.forEach(control => { if (value === null) control.removeAttribute("form"); else control.setAttribute("form", value) }) },
    setAccessibleName(label: string | null, labelledBy: string | null) {
      text(label); text(labelledBy)
      const nodes = count === 2 ? [root] : controls
      map(nodes, "aria-label", label); map(nodes, "aria-labelledby", labelledBy)
    },
    setReverse(value: boolean) { map(controls, "dir", boolean(value) ? "rtl" : null) },
    setVertical(value: boolean) { map([root], "data-vertical", boolean(value) ? "" : null) },
    setFormatValue(value: SliderOptions["formatValue"]) {
      if (value !== undefined && typeof value !== "function") throw new TypeError("Slider formatValue must be a function or undefined.")
      transaction(undefined, () => { formatValue = value }, value ?? null)
    },
    stepUp(n?: number, index?: number) { step(true, n, index) },
    stepDown(n?: number, index?: number) { step(false, n, index) },
    refresh, disconnect,
  }
  for (const node of [root, ...controls]) Object.defineProperty(node, owner, { value: token, configurable: true })
  controls.forEach((control, index) => {
    function nativeChange(commit: boolean) {
      const before = accepted
      try {
        refresh()
        const current = values()
        if (current.some((number, index) => number !== before[index])) notify(current, index)
        if (commit && count === 2) {
          const detail: SliderPairChange = { value: [current[0]!, current[1]!], ordered: current[0]! <= current[1]!, index }
          later(() => eventRoot.dispatchEvent(new view!.CustomEvent("m:slider-pair-change", { detail })))
        }
      } catch (reason) { report(reason) }
    }
    listen(control, "input", () => nativeChange(false))
    listen(control, "change", () => nativeChange(true))
  })
  listen(document!, "reset", event => {
    if (controls.some(node => node.form === event.target) || readouts.some(item => item.node.form === event.target)) later(attemptRefresh)
  }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return { controls, operations, values, setValues, setDefaultValues, get connected() { return connected }, get error() { return error } }
}

/** Enhance an explicitly authored native Web slider; shares the m-slider behavior owner. */
export function createSlider(root: HTMLElement, options: SliderOptions = {}): SliderController {
  const binding = bind(root, 1, options)
  return {
    ...binding.operations,
    control: binding.controls[0]!, get connected() { return binding.connected }, get error() { return binding.error },
    get value() { return binding.values()[0]! }, get defaultValue() { return binding.controls[0]!.defaultValue },
    setValue(value: number) { binding.setValues(sliderNumbers(value, 1)) },
    setDefaultValue(value: string) { binding.setDefaultValues([value]) },
  }
}

/** Enhance two independent native Web tracks, without sorting or changing their bounds. */
export function createSliderPair(root: HTMLFieldSetElement, options: SliderOptions = {}): SliderPairController {
  const binding = bind(root, 2, options)
  const controls: readonly [HTMLInputElement, HTMLInputElement] = Object.freeze([binding.controls[0]!, binding.controls[1]!])
  return {
    ...binding.operations,
    controls, get connected() { return binding.connected }, get error() { return binding.error },
    get value(): [number, number] { const values = binding.values(); return [values[0]!, values[1]!] },
    get defaultValue(): [string, string] { return [controls[0].defaultValue, controls[1].defaultValue] },
    get ordered() { const value = binding.values(); return value[0]! <= value[1]! },
    setValue(value: readonly [number, number]) { binding.setValues(sliderNumbers(value, 2)) },
    setDefaultValue(value: readonly [string, string]) { binding.setDefaultValues(value) },
  }
}
