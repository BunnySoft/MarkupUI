import { createRadioGroup } from "../radio/index.js"

export interface RateOptions {
  count?: number
  allowHalf?: boolean
  formatValue?: (value: number | null, count: number) => string
}
export interface RateController {
  readonly connected: boolean
  readonly error: string | null
  readonly value: number | null
  readonly count: number
  readonly allowHalf: boolean
  setValue(value: number | null): void
  clear(): boolean
  refresh(): void
  disconnect(): void
}
interface Attribute { node: Element; name: string; before: string | null; base: string | null; last: string | null }

/** Reuses Radio's native name/form/tree contract; it never renders or toggles star proxies. */
export function createRate(root: HTMLFieldSetElement, options: RateOptions = {}): RateController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLFieldSetElement) || !root.matches(".mui-rate[data-rate]")) throw new TypeError("Rate needs an authored native .mui-rate[data-rate] fieldset.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["count", "allowHalf", "formatValue"].includes(key))
    || options.count !== undefined && typeof options.count !== "number"
    || options.allowHalf !== undefined && typeof options.allowHalf !== "boolean") throw new TypeError("Unsupported Rate options; use static markup for readonly.")
  const count = options.count ?? 5, allowHalf = options.allowHalf ?? false, formatValue = options.formatValue
  if (!Number.isSafeInteger(count) || count < 1 || count > 10 || typeof allowHalf !== "boolean"
    || formatValue !== undefined && typeof formatValue !== "function") throw new TypeError("Rate count must be 1-10; allowHalf boolean, formatValue a function.")
  const factor = allowHalf ? 2 : 1
  const own = (node: Element) => node.closest("[data-radio-group]") === root
  function one(selector: string) {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1) throw new TypeError(`Rate supports at most one ${selector}.`)
    return nodes[0] ?? null
  }
  const clearButton = one("[data-rate-clear]") as HTMLButtonElement | null
  const output = one("[data-rate-output]")
  function controls() { return [...root.querySelectorAll<HTMLInputElement>("input[data-radio]")].filter(own) }
  function validate() {
    const inputs = controls(), keys = inputs.map(input => input.value)
    const expected = Array.from({ length: count * factor }, (_, index) => String((index + 1) / factor))
    if (keys[0] === "0") expected.unshift("0")
    if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
      throw new TypeError("Author complete ascending score choices with optional leading 0.")
    }
    if (root.hasAttribute("readonly") || inputs.some(input => input.hasAttribute("readonly"))) throw new TypeError("Native radios have no readonly mode; use a static labelled read-only score.")
    if (clearButton && (!(clearButton instanceof view!.HTMLButtonElement) || !root.contains(clearButton)
      || clearButton.getAttribute("type")?.toLowerCase() !== "button"
      || !(clearButton.getAttribute("aria-label")?.trim() || clearButton.textContent?.trim())
      || clearButton.hasAttribute("role") || clearButton.getAttribute("aria-hidden") === "true"
      || clearButton.hasAttribute("popovertarget") || clearButton.hasAttribute("commandfor")
      || clearButton.parentElement?.closest("label, button, a[href], summary")
      || clearButton.querySelector("button, input, select, textarea, a[href], [tabindex], [contenteditable], [role]"))) {
      throw new TypeError("Rate clear needs a named type=button outside labels and other interaction.")
    }
    if (output && (!root.contains(output) || output.localName !== "span" || output.children.length
      || output.hasAttribute("role") || output.hasAttribute("tabindex") || output.hasAttribute("aria-live")
      || output.closest("label"))) throw new TypeError("Rate readout needs a separate text-only span without live/interactive semantics.")
    for (const glyph of root.querySelectorAll(".mui-rate__glyph")) if (own(glyph)
      && (glyph.getAttribute("aria-hidden") !== "true" || glyph.querySelector("[tabindex], [role], input, button, a[href]"))) {
      throw new TypeError("Rate stars/icons must be authored noninteractive aria-hidden decoration.")
    }
    return inputs
  }
  validate()
  const radio = createRadioGroup(root)
  let connected = true, error: string | null = null
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>()
  let outputBefore = output?.textContent ?? "", outputLast = outputBefore
  function lease(node: Element, name: string, enhancement = false) {
    const before = node.getAttribute(name), item = { node, name, before, base: enhancement ? null : before, last: before }
    attributes.push(item); return item
  }
  const clearHidden = clearButton ? lease(clearButton, "hidden", true) : null
  const clearDisabled = clearButton ? lease(clearButton, "disabled") : null
  const outputHidden = output ? lease(output, "hidden", true) : null
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
  function value() { const selected = radio.state.value; return selected === null ? null : Number(selected) }
  function available(input: HTMLInputElement | undefined) {
    return !!input && input.isConnected && !input.matches(":disabled")
      && root.getAttribute("aria-disabled") !== "true" && root.getAttribute("aria-readonly") !== "true"
      && !input.closest("[hidden], [inert]")
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    if (!root.isConnected || root.getRootNode() !== document || !radio.connected) { disconnect(); return }
    attemptRefresh()
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["checked", "disabled", "hidden", "readonly", "value", "type", "role", "aria-hidden", "aria-disabled", "aria-readonly", "form", "data-radio"] })
    for (let node = root.parentElement; node; node = node.parentElement) observer.observe(node, { childList: true })
  }
  function refresh() {
    if (!connected) return
    pause()
    try {
      if (!radio.connected) throw new Error("Radio owner disconnected; recreate Rate.")
      const inputs = validate()
      radio.refresh()
      const score = value()
      const text = formatValue ? formatValue(score, count) : score === null ? "Not rated" : `${score} / ${count}`
      if (typeof text !== "string") throw new TypeError("Rate formatValue must return plain text.")
      if (output) {
        if (output.textContent !== outputLast) outputBefore = output.textContent ?? ""
        if (output.textContent !== text) output.textContent = text
        outputLast = text
        write(outputHidden!, outputHidden!.base)
      }
      if (clearButton) {
        const hide = score === null || clearHidden!.base !== null
        const enabled = available(inputs.find(input => input.checked))
        if ((hide || !enabled || clearDisabled!.base !== null) && document!.activeElement === clearButton) {
          inputs.find(input => available(input))?.focus({ preventScroll: true })
          if (!connected) return
        }
        write(clearHidden!, hide ? clearHidden!.base ?? "" : null)
        write(clearDisabled!, enabled ? clearDisabled!.base : clearDisabled!.base ?? "")
      }
      error = null
    } catch (reason) { error = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally { observe() }
  }
  function report(reason: unknown, previous: string | null) {
    error = reason instanceof Error ? reason.message : String(reason)
    if (error !== previous) root.dispatchEvent(new view!.CustomEvent("mui:rate-error", { detail: { message: error } }))
  }
  function attemptRefresh() { const previous = error; try { refresh() } catch (reason) { report(reason, previous) } }
  function setValue(score: number | null) {
    if (!connected) throw new Error("Rate is disconnected.")
    refresh()
    if (score !== null && (typeof score !== "number" || !Number.isFinite(score) || !controls().some(input => input.value === String(score)))) {
      throw new TypeError("Use an authored numeric score or null.")
    }
    radio.setValue(score === null ? null : String(score)); refresh()
  }
  function clear() {
    refresh()
    if (!connected) return false
    let selected = controls().find(input => input.checked)
    if (!available(selected)) return false
    if (document!.activeElement === clearButton) selected!.focus({ preventScroll: true })
    if (!connected) return false
    selected = validate().find(input => input.checked)
    if (!available(selected)) return false
    const previous = value()
    radio.setValue(null); refresh()
    if (connected) root.dispatchEvent(new view!.CustomEvent("mui:rate-clear", { detail: { previous, value: null } }))
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
    if (clearButton && document!.activeElement === clearButton && clearHidden!.before !== null) controls().find(input => available(input))?.focus({ preventScroll: true })
    if (output?.textContent === outputLast) output.textContent = outputBefore
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    radio.disconnect()
  }
  const controller: RateController = {
    count, allowHalf, get connected() { return connected && radio.connected }, get error() { return error ?? radio.error },
    get value() { if (!connected) throw new Error("Rate is disconnected."); validate(); return value() },
    setValue, clear, refresh, disconnect,
  }
  for (const type of ["input", "change"]) listen(root, type, event => {
    const node = event.target
    if (node instanceof view!.HTMLInputElement && node.hasAttribute("data-radio") && own(node)) attemptRefresh()
  })
  if (clearButton) listen(clearButton, "click", event => later(() => {
    if (!event.defaultPrevented && !clearButton.disabled && !clearButton.hidden && !clearButton.matches(":disabled")) {
      const previous = error; try { clear() } catch (reason) { report(reason, previous) }
    }
  }))
  listen(document!, "reset", event => { if (controls().some(input => input.form === event.target)) later(attemptRefresh) }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return controller
}
