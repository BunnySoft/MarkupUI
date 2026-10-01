import { createRadioGroup, radioMembers } from "../native-radio.js"

export interface RateOptions {
  count?: number
  allowHalf?: boolean
  value?: number | null
  defaultValue?: number | null
  clearable?: boolean
  readonly?: boolean
  disabled?: boolean
  name?: string
  form?: string | null
  formatValue?: (value: number | null, count: number) => string
}
export interface RateController {
  readonly connected: boolean
  readonly error: string | null
  readonly value: number | null
  readonly defaultValue: number | null
  readonly count: number
  readonly allowHalf: boolean
  readonly name: string | null
  readonly form: HTMLFormElement | null
  setValue(value: number | null): void
  setDefaultValue(value: number | null): void
  configure(options: RateOptions): void
  clear(): boolean
  focus(options?: FocusOptions): void
  blur(): void
  refresh(): void
  disconnect(): void
}
interface Attribute { node: Element; name: string; before: string | null; base: string | null; last: string | null }
type RateSettings = Omit<RateOptions, "value" | "defaultValue"> & {
  count: number
  allowHalf: boolean
  clearable: boolean
  readonly: boolean
}

/** @internal */
export function validateRateOptions(options: RateOptions): void {
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.entries(options).some(([key, value]) => value === undefined
      || !["count", "allowHalf", "value", "defaultValue", "clearable", "readonly", "disabled", "name", "form", "formatValue"].includes(key))) {
    throw new TypeError("Unsupported Rate options.")
  }
  if (options.count !== undefined && (!Number.isSafeInteger(options.count) || options.count < 1)) {
    throw new RangeError("Rate count must be a positive safe integer.")
  }
  for (const key of ["allowHalf", "clearable", "readonly", "disabled"] as const) {
    if (options[key] !== undefined && typeof options[key] !== "boolean") throw new TypeError(`Rate ${key} must be boolean.`)
  }
  if (options.name !== undefined && (typeof options.name !== "string" || !options.name.trim())) throw new TypeError("Rate name must be nonempty.")
  if (options.form !== undefined && options.form !== null && (typeof options.form !== "string" || !options.form.trim())) throw new TypeError("Rate form must be an ID or null.")
  if (options.formatValue !== undefined && typeof options.formatValue !== "function") throw new TypeError("Rate formatValue must be a function.")
}

/** @internal */
export function validateRateScore(score: number | null, count: number, allowHalf: boolean): void {
  if (score !== null && (typeof score !== "number" || !Number.isFinite(score) || score < 0
    || score > count || !Number.isInteger(score * (allowHalf ? 2 : 1)))) {
    throw new RangeError("Rate score must be null or a bounded whole/half-step number.")
  }
}

/** @internal */
export function readRateValue(root: HTMLFieldSetElement): number | null {
  const selected = radioMembers(root).find(input => input.checked)
  return selected ? Number(selected.value) : null
}
/** @internal */
export function readRateDefaultValue(root: HTMLFieldSetElement): number | null {
  const selected = radioMembers(root).filter(input => input.defaultChecked).at(-1)
  return selected ? Number(selected.value) : null
}
/** @internal */
export function readRateName(root: HTMLFieldSetElement): string | null {
  return radioMembers(root)[0]?.name ?? null
}
/** @internal */
export function readRateForm(root: HTMLFieldSetElement): HTMLFormElement | null {
  return radioMembers(root)[0]?.form ?? null
}

/** @internal */
export function validateRateSchema(root: HTMLFieldSetElement, options: RateOptions & { count: number; allowHalf: boolean }): void {
  validateRateScore(options.value !== undefined ? options.value : readRateValue(root), options.count, options.allowHalf)
  validateRateScore(options.defaultValue !== undefined ? options.defaultValue : readRateDefaultValue(root), options.count, options.allowHalf)
  if (options.defaultValue === undefined) for (const input of radioMembers(root)) if (input.defaultChecked) {
    validateRateScore(Number(input.value), options.count, options.allowHalf)
  }
}

/** One concrete Rate owner; native-radio alone validates native grouping and writes checkedness. */
export function createRate(root: HTMLFieldSetElement, options: RateOptions = {}): RateController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLFieldSetElement) || !root.matches(".m-rate[data-rate]")) {
    throw new TypeError("Rate needs a native .m-rate[data-rate] fieldset.")
  }
  validateRateOptions(options)
  const generated = root.getAttribute("data-part") === "rate" && root.getAttribute("data-state") === "generated"
  const initializing = generated && !root.querySelector("input[data-radio]")
  const { value: initialValue, defaultValue: initialDefault, ...configuration } = options
  let settings: RateSettings = { count: 5, allowHalf: false, clearable: false, readonly: false, ...configuration }
  if (initialValue !== undefined) validateRateScore(initialValue, settings.count, settings.allowHalf)
  if (initialDefault !== undefined) validateRateScore(initialDefault, settings.count, settings.allowHalf)
  if (generated && !initializing) validateRateSchema(root, { ...settings, ...options })
  let connected = true, error: string | null = null
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>()
  const own = (node: Element) => node.closest("[data-radio-group]") === root
  function controls() { return [...root.querySelectorAll<HTMLInputElement>("input[data-radio]")].filter(own) }
  function one(selector: string) {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1) throw new TypeError(`Rate supports at most one ${selector}.`)
    return nodes[0] ?? null
  }
  function count() { return settings.count }
  function half() { return settings.allowHalf }
  function expected(config: RateOptions = settings) {
    const factor = config.allowHalf ? 2 : 1
    return Array.from({ length: config.count! * factor }, (_, index) => String((index + 1) / factor))
  }
  function render() {
    if (!generated) return
    let choices = one(".m-rate__choices")
    if (!choices) {
      choices = document!.createElement("div")
      choices.className = "m-rate__choices"
      root.append(choices)
    }
    const existing = new Map(controls().map(input => [input.value, input]))
    const keys = ["0", ...expected()]
    for (const [key, input] of existing) if (!keys.includes(key)) {
      const label = input.closest("label")
      if (label?.getAttribute("data-state") !== "generated") throw new TypeError("Rate cannot remove an authored choice.")
      label.remove()
    }
    for (const key of keys) {
      let input = existing.get(key)
      if (!input) {
        const label = document!.createElement("label")
        label.className = "m-rate__choice"
        label.setAttribute("data-state", "generated")
        input = document!.createElement("input")
        input.type = "radio"
        input.setAttribute("data-radio", "")
        const first = existing.values().next().value
        input.name = first?.name ?? settings.name ?? ""
        const form = first ? first.getAttribute("form") : settings.form
        if (form) input.setAttribute("form", form)
        input.value = key
        const glyph = document!.createElement("span")
        glyph.className = "m-rate__glyph"
        glyph.setAttribute("aria-hidden", "true")
        glyph.textContent = Number(key) === 0 ? "\u2606" : "\u2605"
        if (!Number.isInteger(Number(key))) {
          glyph.setAttribute("data-half", "")
          const fill = document!.createElement("span")
          fill.className = "m-rate__half-fill"
          fill.textContent = "\u2605"
          glyph.append(fill)
        }
        const score = document!.createElement("span")
        score.className = "m-rate__score"
        score.setAttribute("data-part", "score")
        label.append(input, glyph, score)
        choices.append(label)
      }
      const label = input.closest("label")
      if (label?.getAttribute("data-state") === "generated") {
        label.querySelector('[data-part="score"]')!.textContent = `${key} of ${count()}`
        const position = keys.indexOf(key)
        if (choices.children[position] !== label) choices.insertBefore(label, choices.children[position] ?? null)
      }
    }
    if (settings.clearable && !one("[data-rate-clear]")) {
      const button = document!.createElement("button")
      button.type = "button"
      button.setAttribute("data-rate-clear", "")
      button.setAttribute("data-state", "generated")
      button.textContent = "Clear rating"
      root.append(button)
    }
  }
  function validate() {
    const inputs = controls(), keys = inputs.map(input => input.value), ordered = expected()
    if (keys[0] === "0") ordered.unshift("0")
    if (keys.length !== ordered.length || keys.some((key, index) => key !== ordered[index])) {
      throw new TypeError("Author complete ascending score choices with optional leading 0.")
    }
    if (root.hasAttribute("readonly") || inputs.some(input => input.hasAttribute("readonly"))) throw new TypeError("Native radios have no readonly attribute; configure Rate readonly instead.")
    const clearButton = one("[data-rate-clear]"), output = one("[data-rate-output]")
    if (clearButton && (!(clearButton instanceof view!.HTMLButtonElement)
      || clearButton.getAttribute("type")?.toLowerCase() !== "button"
      || !(clearButton.getAttribute("aria-label")?.trim() || clearButton.textContent?.trim())
      || clearButton.hasAttribute("role") || clearButton.getAttribute("aria-hidden") === "true"
      || clearButton.hasAttribute("popovertarget") || clearButton.hasAttribute("commandfor")
      || clearButton.parentElement?.closest("label, button, a[href], summary")
      || clearButton.querySelector("button, input, select, textarea, a[href], [tabindex], [contenteditable], [role]"))) {
      throw new TypeError("Rate clear needs a named type=button outside labels and other interaction.")
    }
    if (output && (output.localName !== "span" || output.children.length
      || output.hasAttribute("role") || output.hasAttribute("tabindex") || output.hasAttribute("aria-live")
      || output.closest("label"))) throw new TypeError("Rate readout needs a separate text-only span without live/interactive semantics.")
    for (const glyph of root.querySelectorAll(".m-rate__glyph")) if (own(glyph)
      && (glyph.getAttribute("aria-hidden") !== "true" || glyph.querySelector("[tabindex], [role], input, button, a[href]"))) {
      throw new TypeError("Rate stars/icons must be authored noninteractive aria-hidden decoration.")
    }
    return inputs
  }
  function lease(node: Element, name: string, enhancement = false) {
    let item = attributes.find(item => item.node === node && item.name === name)
    if (!item) {
      const before = node.getAttribute(name)
      item = { node, name, before, base: enhancement ? null : before, last: before }
      attributes.push(item)
    }
    return item
  }
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
  function applyAssociation(update: RateOptions = {}) {
    if (update.disabled !== undefined) root.disabled = update.disabled
    if (settings.readonly || attributes.some(item => item.node === root && item.name === "aria-readonly")) {
      const item = lease(root, "aria-readonly")
      write(item, settings.readonly ? "true" : item.base)
    }
    for (const input of controls()) {
      if (update.name !== undefined) input.name = update.name
      if (update.form !== undefined) {
        if (update.form === null) input.removeAttribute("form")
        else input.setAttribute("form", update.form)
      }
      const disabled = lease(input, "disabled")
      write(disabled, settings.readonly ? "" : disabled.base)
    }
  }
  if (!generated) validate()
  const radio = createRadioGroup(root)
  const outputText = new Map<HTMLElement, { before: string; last: string }>()
  function value() { const selected = radio.state.value; return selected === null ? null : Number(selected) }
  function available(input: HTMLInputElement | undefined) {
    return !!input && input.isConnected && !input.matches(":disabled") && !settings.readonly
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
      attributeFilter: ["checked", "disabled", "hidden", "readonly", "value", "type", "name", "role", "aria-hidden", "aria-disabled", "aria-readonly", "form", "data-radio", "data-rate-clear", "data-rate-output"] })
    for (let node = root.parentElement; node; node = node.parentElement) observer.observe(node, { childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"] })
  }
  function refresh() {
    if (!connected) throw new Error("Rate is disconnected.")
    pause()
    try {
      if (!radio.connected) throw new Error("Radio owner disconnected; recreate Rate.")
      const inputs = validate()
      applyAssociation()
      radio.refresh()
      const score = value()
      const text = settings.formatValue ? settings.formatValue(score, count()) : score === null ? "Not rated" : `${score} / ${count()}`
      if (typeof text !== "string") throw new TypeError("Rate formatValue must return plain text.")
      const output = one("[data-rate-output]")
      if (output) {
        let item = outputText.get(output)
        if (!item) { item = { before: output.textContent ?? "", last: output.textContent ?? "" }; outputText.set(output, item) }
        if (output.textContent !== item.last) item.before = output.textContent ?? ""
        if (output.textContent !== text) output.textContent = text
        item.last = text
        const hidden = lease(output, "hidden", true)
        write(hidden, hidden.base)
      }
      const clearButton = one("[data-rate-clear]") as HTMLButtonElement | null
      if (clearButton) {
        const hidden = lease(clearButton, "hidden", true), disabled = lease(clearButton, "disabled")
        const hide = score === null || hidden.base !== null
          || clearButton.getAttribute("data-state") === "generated" && !settings.clearable
        const enabled = available(inputs.find(input => input.checked))
        if ((hide || !enabled || disabled.base !== null) && document!.activeElement === clearButton) focus({ preventScroll: true })
        write(hidden, hide ? hidden.base ?? "" : null)
        write(disabled, enabled ? disabled.base : disabled.base ?? "")
      }
      error = null
    } catch (reason) { error = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally { observe() }
  }
  function report(reason: unknown, previous: string | null) {
    error = reason instanceof Error ? reason.message : String(reason)
    if (error !== previous) root.dispatchEvent(new view!.CustomEvent("m:rate-error", { detail: { message: error } }))
  }
  function attemptRefresh() { const previous = error; try { refresh() } catch (reason) { report(reason, previous) } }
  function setValue(score: number | null) {
    refresh()
    validateRateScore(score, count(), half())
    clearGeneration++
    pendingClear = false
    radio.setValue(score === null ? null : String(score))
    refresh()
  }
  function setDefaultValue(score: number | null) {
    refresh()
    validateRateScore(score, count(), half())
    const inputs = controls()
    if (score !== null && !inputs.some(input => input.value === String(score))) throw new TypeError("Use an authored numeric score or null.")
    const live = value()
    pause()
    try {
      for (const input of inputs) input.defaultChecked = input.value === String(score)
      radio.setValue(live === null ? null : String(live))
    } finally { observe() }
    refresh()
  }
  function cancelTasks() { tasks.forEach(id => view!.clearTimeout(id)); tasks.clear(); pendingClear = false }
  function configure(update: RateOptions) {
    if (!connected || !radio.connected) throw new Error("Rate is disconnected.")
    validateRateOptions(update)
    const { value: nextValue, defaultValue: nextDefault, ...configuration } = update
    const next = { ...settings, ...configuration }
    validateRateSchema(root, { ...next, ...update })
    if (!generated) {
      const keys = controls().map(input => input.value)
      const ordered = expected(next)
      if (keys[0] === "0") ordered.unshift("0")
      if (keys.length !== ordered.length || keys.some((key, index) => key !== ordered[index])) throw new TypeError("Update authored ascending choices before configuring Rate schema.")
    }
    cancelTasks()
    pause()
    try {
      const active = document!.activeElement
      settings = next
      render()
      applyAssociation(update)
      refresh()
      if (nextDefault !== undefined) setDefaultValue(nextDefault)
      if (nextValue !== undefined) setValue(nextValue)
      if (active instanceof view!.HTMLInputElement && !active.isConnected) focus({ preventScroll: true })
    } finally { observe() }
  }
  function focus(options?: FocusOptions) {
    const inputs = validate()
    const selected = inputs.find(input => input.checked && available(input))
    ;(selected ?? inputs.find(input => available(input)))?.focus(options)
  }
  function blur() { controls().find(input => input === document!.activeElement)?.blur() }
  function changed(score: number | null) {
    root.dispatchEvent(new view!.CustomEvent("m:change", { detail: { value: score }, bubbles: true }))
  }
  function clear() {
    refresh()
    let selected = controls().find(input => input.checked)
    if (!available(selected)) return false
    if (document!.activeElement === one("[data-rate-clear]")) selected!.focus({ preventScroll: true })
    if (!connected || !root.isConnected) return false
    selected = validate().find(input => input.checked)
    if (!available(selected)) return false
    const previous = value()
    radio.setValue(null)
    refresh()
    root.dispatchEvent(new view!.CustomEvent("m:rate-clear", { detail: { previous, value: null } }))
    if (connected && root.isConnected) changed(null)
    return true
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => {
      tasks.delete(id)
      if (connected && root.isConnected && radio.connected) callback()
    }, 0)
    tasks.add(id)
  }
  function listen(node: EventTarget, type: string, callback: EventListener, capture = false) {
    node.addEventListener(type, callback, capture)
    removers.push(() => node.removeEventListener(type, callback, capture))
  }
  function disconnect() {
    if (!connected) return
    pause()
    connected = false
    removers.splice(0).forEach(remove => remove())
    cancelTasks()
    for (const [output, text] of outputText) if (output.textContent === text.last) output.textContent = text.before
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    radio.disconnect()
  }
  let pendingClear = false
  let clearGeneration = 0
  const controller: RateController = {
    get count() { return count() }, get allowHalf() { return half() },
    get connected() { return connected && radio.connected }, get error() { return error ?? radio.error },
    get value() { if (!connected) throw new Error("Rate is disconnected."); validate(); return value() },
    get defaultValue() { if (!connected) throw new Error("Rate is disconnected."); return readRateDefaultValue(root) },
    get name() { return radio.state.name }, get form() { return radio.state.form },
    setValue, setDefaultValue, configure, clear, focus, blur, refresh, disconnect,
  }
  for (const type of ["input", "change"]) listen(root, type, event => {
    const node = event.target
    if (node instanceof view!.HTMLInputElement && node.hasAttribute("data-radio") && own(node)) {
      if (type === "change") clearGeneration++
      attemptRefresh()
    }
  })
  listen(root, "m:radio-group-change", event => {
    if (event.target !== root) return
    const previous = error
    try {
      refresh()
      if (!(event instanceof view!.CustomEvent) || typeof event.detail?.value !== "string") throw new TypeError("Rate expects a native Radio change detail.")
      const score = Number(event.detail.value)
      validateRateScore(score, count(), half())
      changed(score)
    } catch (reason) { report(reason, previous) }
  })
  listen(root, "click", event => {
    const target = event.target
    if (!(target instanceof view!.Element) || !own(target) || pendingClear) return
    const button = target.closest<HTMLButtonElement>("[data-rate-clear]")
    const label = target.closest("label")
    const selected = controls().find(input => input.checked)
    const toggle = settings.clearable && label && selected?.labels && [...selected.labels].includes(label)
    if (!button && !toggle) return
    pendingClear = true
    const generation = clearGeneration
    later(() => {
      pendingClear = false
      if (generation !== clearGeneration || event.defaultPrevented || button && (button.disabled || button.hidden || button.matches(":disabled"))
        || toggle && !selected?.checked) return
      const previous = error
      try { clear() } catch (reason) { report(reason, previous) }
    })
  })
  listen(document!, "reset", event => {
    if (controls().some(input => input.form === event.target)) later(() => {
      if (!event.defaultPrevented) attemptRefresh()
    })
  }, true)
  try {
    render()
    validate()
    applyAssociation(options)
    if (initializing) {
      setDefaultValue(initialDefault !== undefined ? initialDefault : initialValue !== undefined ? initialValue : 0)
    } else if (initialDefault !== undefined) setDefaultValue(initialDefault)
    if (initialValue !== undefined) setValue(initialValue)
    else if (initializing) setValue(0)
    refresh()
  } catch (reason) { disconnect(); throw reason }
  return controller
}
