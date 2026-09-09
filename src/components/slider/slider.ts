export interface SliderOptions { formatValue?: (value: number, index: number) => string }
interface SliderLifetime {
  readonly connected: boolean
  readonly error: string | null
  refresh(): void
  disconnect(): void
}
export interface SliderController extends SliderLifetime {
  readonly control: HTMLInputElement
  readonly value: number
  setValue(value: number): void
}
export interface SliderPairController extends SliderLifetime {
  readonly controls: readonly [HTMLInputElement, HTMLInputElement]
  readonly value: [number, number]
  readonly ordered: boolean
  setValue(value: readonly [number, number]): void
}
export interface SliderPairChange { value: [number, number]; ordered: boolean; index: number }
const owner = Symbol.for("markup-ui.slider.owner")
type Owned = Element & { [owner]?: object }
interface Attribute { node: Element; name: string; before: string | null; base: string | null; last: string | null }
interface Readout { node: HTMLOutputElement; control: HTMLInputElement; before: string; last: string }

function bind(root: HTMLElement, count: 1 | 2, options: SliderOptions) {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement)) throw new TypeError("Slider needs an authored root.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => key !== "formatValue")
    || options.formatValue !== undefined && typeof options.formatValue !== "function") throw new TypeError("Slider accepts only a plain-string formatValue callback.")
  if ((root as Owned)[owner]) throw new Error("Slider root already has an owner.")
  const formatValue = options.formatValue
  const token = {}, boundary = "[data-slider], [data-slider-pair]"
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
      || !root.matches(count === 1 ? ".mui-slider[data-slider]" : "fieldset.mui-slider-pair[data-slider-pair]")
      || root.hasAttribute("role") || root.hasAttribute("tabindex") || root.closest("label, button, a[href], summary")
      || count === 2 && ![...root.children].find(node => node.localName === "legend")?.textContent?.trim()) {
      throw new TypeError("Keep Slider in a connected light-DOM root without a role/tabstop; pairs need a named first fieldset legend.")
    }
    const current = [...root.querySelectorAll("[data-slider-control]")].filter(own)
    if (current.length !== count || current.some((node, index) => node !== controls[index])) {
      throw new TypeError("Slider controls/order changed; disconnect and recreate the binding.")
    }
    for (const control of controls) {
      if (control.type !== "range" || control.hasAttribute("role") || control.hasAttribute("readonly")
        || ![...control.labels ?? []].some(label => label.textContent?.trim()) || !Number.isFinite(control.valueAsNumber)) {
        throw new TypeError("Use labelled native input[type=range] controls with finite native values; no replacement roles or readonly.")
      }
      if ((control as Owned)[owner] && (control as Owned)[owner] !== token) throw new Error("Native slider already has an owner.")
    }
    for (const item of readouts) if (!root.contains(item.node) || !own(item.node) || item.node.children.length
      || item.node.getAttribute("aria-live") !== "off" || !item.control.id || item.node.htmlFor.length !== 1
      || !item.node.htmlFor.contains(item.control.id)) throw new TypeError("Keep the original non-live readouts associated with their native sliders.")
  }
  validate()
  let connected = true, error: string | null = null
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>()
  function lease(node: Element, name: string, enhancement = false) {
    const before = node.getAttribute(name)
    const item = { node, name, before, base: enhancement ? null : before, last: before }
    attributes.push(item)
    return item
  }
  for (const item of readouts) lease(item.node, "hidden", true)
  if (formatValue) controls.forEach(control => lease(control, "aria-valuetext"))
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
    if (!root.isConnected || root.getRootNode() !== document || controls.some(node => !root.contains(node))) { disconnect(); return }
    attemptRefresh()
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["min", "max", "step", "value", "disabled", "readonly", "type", "role", "hidden", "form",
        "for", "id", "aria-valuetext", "aria-live", "data-slider-control"] })
    for (let node = root.parentElement; node; node = node.parentElement) observer.observe(node, { childList: true })
  }
  function values() { validate(); return controls.map(control => control.valueAsNumber) }
  function refresh() {
    if (!connected) return
    pause()
    try {
      const numbers = values()
      const texts = controls.map((control, index) => formatValue ? formatValue(numbers[index]!, index) : control.value)
      if (texts.some(text => typeof text !== "string")) throw new TypeError("formatValue must return plain text, never HTML/VNodes.")
      for (const [index, control] of controls.entries()) {
        const text = texts[index]!
        if (formatValue) write(attr(control, "aria-valuetext"), text)
        const item = readouts.find(item => item.control === control)
        if (item) {
          if (item.node.value !== item.last) item.before = item.node.value
          if (item.node.value !== text) item.node.value = text
          item.last = text
          const hidden = attr(item.node, "hidden"); write(hidden, hidden.base)
        }
      }
      error = null
    } catch (reason) { error = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally { observe() }
  }
  function report(reason: unknown, previous: string | null) {
    error = reason instanceof Error ? reason.message : String(reason)
    if (previous !== error) root.dispatchEvent(new view!.CustomEvent("mui:slider-error", { detail: { message: error } }))
  }
  function attemptRefresh() { const previous = error; try { refresh() } catch (reason) { report(reason, previous) } }
  function setValues(next: readonly number[]) {
    if (!connected) throw new Error("Slider is disconnected.")
    if (!Array.isArray(next) || next.length !== count || next.some(value => typeof value !== "number" || !Number.isFinite(value))) {
      throw new TypeError(`Slider needs ${count} finite number${count === 2 ? "s" : ""}; range inputs have no null/empty state.`)
    }
    validate()
    for (const [index, control] of controls.entries()) control.value = String(next[index]!)
    refresh()
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
    for (const item of readouts) if (item.node.value === item.last) item.node.value = item.before
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    for (const node of [root, ...controls] as Owned[]) if (node[owner] === token) delete node[owner]
  }
  const result = {
    controls, get connected() { return connected }, get error() { return error },
    values() { if (!connected) throw new Error("Slider is disconnected."); return values() },
    setValues, refresh, disconnect,
  }
  for (const node of [root, ...controls]) Object.defineProperty(node, owner, { value: token, configurable: true })
  controls.forEach((control, index) => {
    listen(control, "input", attemptRefresh)
    listen(control, "change", () => {
      const previous = error
      try {
        refresh()
        if (count === 2) {
          const value = values() as [number, number]
          const detail: SliderPairChange = { value, ordered: value[0] <= value[1], index }
          later(() => root.dispatchEvent(new view!.CustomEvent("mui:slider-pair-change", { detail })))
        }
      } catch (reason) { report(reason, previous) }
    })
  })
  listen(document!, "reset", event => {
    if (controls.some(node => node.form === event.target) || readouts.some(item => item.node.form === event.target)) later(attemptRefresh)
  }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return result
}

export function createSlider(root: HTMLElement, options: SliderOptions = {}): SliderController {
  const binding = bind(root, 1, options)
  return {
    control: binding.controls[0]!, get connected() { return binding.connected }, get error() { return binding.error },
    get value() { return binding.values()[0]! },
    setValue(value: number) { binding.setValues([value]) },
    refresh: binding.refresh, disconnect: binding.disconnect,
  }
}
export function createSliderPair(root: HTMLFieldSetElement, options: SliderOptions = {}): SliderPairController {
  const binding = bind(root, 2, options)
  return {
    controls: Object.freeze([...binding.controls]) as unknown as readonly [HTMLInputElement, HTMLInputElement],
    get connected() { return binding.connected }, get error() { return binding.error },
    get value() { return binding.values() as [number, number] },
    get ordered() { const value = binding.values(); return value[0]! <= value[1]! },
    setValue(value: readonly [number, number]) { binding.setValues(value) },
    refresh: binding.refresh, disconnect: binding.disconnect,
  }
}
