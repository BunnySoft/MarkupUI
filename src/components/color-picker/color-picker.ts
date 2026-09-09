export interface ColorPickerController {
  readonly control: HTMLInputElement
  readonly hex: HTMLInputElement | null
  readonly value: string
  readonly dirty: boolean
  readonly connected: boolean
  readonly error: unknown
  setValue(value: string): void
  commit(): boolean
  restoreDraft(): void
  refresh(): void
  disconnect(): void
}
interface Attribute { node: HTMLElement; name: string; before: string | null; base: string | null; last: string | null }
const owner = Symbol.for("markup-ui.color-picker.owner")
type Owned = Element & { [owner]?: ColorPickerController }
const grammar = "#[0-9a-fA-F]{6}"
function color(value: unknown): value is string { return typeof value === "string" && value.length === 7 && /^#[0-9a-fA-F]{6}$/.test(value) }

/** Coordinates classic RGB native color and optional hex drafts; never opens a picker or parses other formats. */
export function createColorPicker(root: HTMLElement): ColorPickerController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches("[data-color-picker]")) throw new TypeError("Color Picker needs an authored data-color-picker root.")
  const own = (node: Element) => node.closest("[data-color-picker]") === root
  function one(selector: string, required = false) {
    const matches = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (matches.length > 1 || required && matches.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} owned ${selector}.`)
    return matches[0] ?? null
  }
  const node = one("[data-color-control]", true), draft = one("[data-color-hex]"), entry = one("[data-color-entry]")
  const output = one("[data-color-output]"), applyNode = one("[data-color-apply]"), revertNode = one("[data-color-revert]")
  if (!(node instanceof view.HTMLInputElement) || draft && !(draft instanceof view.HTMLInputElement)
    || applyNode && !(applyNode instanceof view.HTMLButtonElement) || revertNode && !(revertNode instanceof view.HTMLButtonElement)) throw new TypeError("Use native color/text inputs and type=button actions.")
  const control = node, hex = draft as HTMLInputElement | null, apply = applyNode as HTMLButtonElement | null, revert = revertNode as HTMLButtonElement | null
  const nodes = [root, control, ...[hex, entry, output, apply, revert].filter((node): node is HTMLElement => !!node)]
  if (new Set(nodes).size !== nodes.length) throw new TypeError("Color controls, readout, entry and action nodes must be distinct.")
  for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Color Picker node already has an owner.")
  function named(node: HTMLInputElement | HTMLButtonElement) {
    return !!(node.getAttribute("aria-label")?.trim() || [...node.labels ?? []].some(label => label.textContent?.trim())
      || node.localName === "button" && node.textContent?.trim())
  }
  function anatomy() {
    if (one("[data-color-control]", true) !== control || one("[data-color-hex]") !== hex || one("[data-color-entry]") !== entry
      || one("[data-color-output]") !== output || one("[data-color-apply]") !== apply || one("[data-color-revert]") !== revert) throw new TypeError("Keep the original Color Picker controls and mappings.")
    if (!root.isConnected || root.getRootNode() !== document || root.closest("label, button, a[href], summary")
      || nodes.some(node => node !== root && (!root.contains(node) || !own(node)))
      || control.type !== "color" || !named(control) || control.hasAttribute("role") || control.hidden || control.getAttribute("aria-hidden") === "true"
      || ["alpha", "colorspace", "readonly", "required"].some(name => control.hasAttribute(name))
      || !color(control.value) || control.hasAttribute("value") && !color(control.defaultValue)) {
      throw new TypeError("Use a labelled classic RGB color input with valid #RRGGBB current/default values; alpha/colorspace/readonly/required-empty modes are outside this helper.")
    }
    if (control.list && [...control.list.options].some(option => !color(option.value))) throw new TypeError("Native datalist swatches must be literal six-digit RGB hex values.")
    if (!!hex !== !!entry || !!hex !== !!apply || revert && !hex
      || hex && (hex.type !== "text" || hex.hasAttribute("name") || !named(hex) || hex.hasAttribute("role") || hex.hasAttribute("hidden")
        || hex.form !== control.form || hex.pattern !== grammar || hex.maxLength !== 7 || !hex.required
        || !entry!.contains(hex) || !entry!.contains(apply!) || revert && !entry!.contains(revert))) {
      throw new TypeError("Pair an unnamed labelled text input with required, maxlength=7 and pattern=#[0-9a-fA-F]{6}, an entry region and Apply button.")
    }
    for (const button of [apply, revert]) if (button && (button.getAttribute("type")?.toLowerCase() !== "button" || !named(button)
      || button.hasAttribute("role") || button.getAttribute("aria-hidden") === "true" || button.hasAttribute("popovertarget") || button.hasAttribute("commandfor")
      || button.parentElement?.closest("label, button, a[href], summary")
      || button.querySelector("input, button, select, textarea, a[href], [tabindex], [contenteditable], [role]"))) throw new TypeError("Color draft actions must be separate labelled native type=button controls.")
    if (output && (!["span", "p"].includes(output.localName) || output.children.length || output.hasAttribute("role") || output.hasAttribute("aria-live")
      || output.hasAttribute("tabindex") || output.isContentEditable
      || output.closest('label, button, a[href], [aria-live]:not([aria-live="off" i]), [role~="alert" i], [role~="status" i], [role~="log" i]'))) throw new TypeError("The color readout must be separate plain nonlive text.")
  }
  anatomy()
  if (output && !output.hidden || hex && (!entry!.hidden || !hex.disabled || !apply!.hidden || revert && !revert.hidden)) {
    throw new TypeError("Start readout/hex entry/actions hidden and the auxiliary hex field explicitly disabled for native no-JS fallback.")
  }
  let connected = true, composing = false, fenced = false, composition = 0, generation = 0, error: unknown = null
  let reset: { event: Event; composition: number } | null = null
  const generated = new WeakSet<Event>()
  let draftDirty = !!hex && hex.value !== hex.defaultValue, lastText = hex?.value ?? ""
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>()
  let outputBefore = output?.textContent ?? "", outputLast = outputBefore
  function lease(node: HTMLElement, name: string, enhance = false) {
    const before = node.getAttribute(name)
    attributes.push({ node, name, before, base: enhance ? null : before, last: before })
  }
  if (output) lease(output, "hidden", true)
  if (hex) {
    lease(entry!, "hidden", true); lease(hex, "disabled", true)
    for (const button of [apply, revert]) if (button) { lease(button, "hidden", true); lease(button, "disabled") }
  }
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const item = attributes.find(item => item.node === record.target && item.name === record.attributeName)
      if (item) item.before = item.base = item.last = item.node.getAttribute(item.name)
    }
  }
  function attribute(node: HTMLElement, name: string) { return attributes.find(item => item.node === node && item.name === name)! }
  function write(item: Attribute, value: string | null) {
    if (item.node.getAttribute(item.name) !== value) {
      if (value === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, value)
    }
    item.last = value
  }
  function shown(node: HTMLElement) {
    if (!node.isConnected || node.closest("[hidden], [inert]")) return false
    for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
      const style = view!.getComputedStyle(parent)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function editable() { return !!hex && shown(hex) && !hex.matches(":disabled") && !hex.readOnly && !composing && !fenced }
  function usableColor() { return shown(control) && !control.matches(":disabled") }
  function dirty() { return !!hex && (draftDirty || hex.value !== lastText) }
  function syncText(value: string) {
    if (!hex || hex.value === value) { lastText = value; return }
    const selected = document!.activeElement === hex ? [hex.selectionStart, hex.selectionEnd, hex.selectionDirection] as const : null
    hex.value = value; lastText = value
    if (selected && selected[0] !== null && selected[1] !== null) hex.setSelectionRange(selected[0], selected[1], selected[2] ?? undefined)
  }
  function synchronize() {
    anatomy()
    const previous = document!.activeElement
    if (hex && hex.value !== lastText) draftDirty = true
    for (const item of attributes) if (item.name === "hidden") write(item, item.base)
    if (hex) {
      const disabled = attribute(hex, "disabled")
      write(disabled, shown(hex) ? disabled.base : disabled.base ?? "")
      for (const button of [apply, revert]) if (button) {
        const item = attribute(button, "disabled")
        write(item, editable() && (button !== apply || usableColor()) ? item.base : item.base ?? "")
      }
      if (!dirty() && !composing) syncText(control.value)
    }
    if (output) {
      if (output.textContent !== outputLast) outputBefore = output.textContent ?? ""
      if (output.textContent !== control.value) output.textContent = control.value
      outputLast = control.value
    }
    if (previous instanceof view!.HTMLElement && [hex, apply, revert].includes(previous as HTMLInputElement | HTMLButtonElement)
      && (!shown(previous) || previous.matches(":disabled")) && (document!.activeElement === previous || document!.activeElement === document!.body)) {
      if (editable()) hex!.focus({ preventScroll: true })
      else if (usableColor()) control.focus({ preventScroll: true })
      else if (document!.activeElement === previous) previous.blur()
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    try { refresh() } catch { /* refresh reports and withdraws invalid enhancement. */ }
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (connected) observer.observe(document!, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["type", "alpha", "colorspace", "readonly", "required", "value", "disabled", "hidden", "inert", "form", "id",
        "list", "pattern", "maxlength", "name", "role", "aria-live", "aria-label", "class", "style", "tabindex", "contenteditable"] })
  }
  function fail(reason: unknown) {
    error = reason
    root.dispatchEvent(new view!.CustomEvent("mui:color-picker-error", { detail: { error: reason } }))
  }
  function settleReset(preserveDraft = false) {
    const previous = reset
    if (!previous || previous.event.eventPhase !== 0) return false
    reset = null
    if (previous.event.defaultPrevented) return false
    if (composition === previous.composition) { composing = false; fenced = false }
    generation++
    draftDirty = !!hex && (preserveDraft || hex.value !== hex.defaultValue)
    if (hex && !draftDirty) lastText = hex.value
    return true
  }
  function refresh() {
    if (!connected) return
    settleReset()
    pause()
    try { synchronize(); error = null }
    catch (reason) { disconnect(); fail(reason); throw reason }
    finally { observe() }
  }
  function ensure() {
    if (!connected) throw new Error("Color Picker is disconnected.")
    if (settleReset()) refresh()
    if (!connected) throw new Error("Color Picker is disconnected.")
    anatomy()
  }
  function setValue(value: string) {
    if (!color(value)) throw new TypeError("Use exactly #RRGGBB; null/empty, alpha, shorthand, named and functional colors are not supported.")
    ensure(); generation++
    const before = control.value, canonical = value.toLowerCase()
    control.value = canonical
    if (control.value !== canonical) { control.value = before; throw new Error("This native color control does not preserve the classic RGB serialization contract.") }
    pause()
    try { synchronize() } finally { observe() }
  }
  function restoreDraft() {
    ensure()
    if (!hex) return
    if (composing || fenced) throw new view!.DOMException("Finish composition before replacing the draft.", "InvalidStateError")
    generation++; pause()
    try { draftDirty = false; syncText(control.value); synchronize() } finally { observe() }
  }
  function commit() {
    ensure()
    if (!editable() || !usableColor() || !color(hex!.value) || !hex!.validity.valid) return false
    const target = hex!.value.toLowerCase(), before = control.value, revision = generation
    setValue(target)
    if (!connected || generation !== revision + 1 || control.value !== target || !editable() || !usableColor()) return false
    restoreDraft()
    const version = generation
    if (before !== target) {
      const input = new view!.Event("input", { bubbles: true, composed: true }); generated.add(input)
      control.dispatchEvent(input)
      if (connected && generation === version && control.value === target) {
        const change = new view!.Event("change", { bubbles: true }); generated.add(change); control.dispatchEvent(change)
      }
    }
    return true
  }
  function listen(node: EventTarget, type: string, handler: EventListener, capture = false) {
    node.addEventListener(type, handler, capture); removers.push(() => node.removeEventListener(type, handler, capture))
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
    if (previous instanceof view!.HTMLElement && [hex, apply, revert].includes(previous as HTMLInputElement | HTMLButtonElement)
      && (!shown(previous) || previous.matches(":disabled")) && (document!.activeElement === previous || document!.activeElement === document!.body)) {
      if (usableColor()) control.focus({ preventScroll: true })
      else if (document!.activeElement === previous) previous.blur()
    }
  }
  const api: ColorPickerController = { control, hex, get value() { ensure(); return control.value }, get dirty() { return dirty() },
    get connected() { return connected }, get error() { return error }, setValue, commit, restoreDraft, refresh, disconnect }
  for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
  for (const type of ["input", "change"]) listen(control, type, event => {
    if (!generated.has(event)) { generation++; try { refresh() } catch { /* Explicit component error event. */ } }
  })
  if (hex) {
    listen(hex, "input", event => {
      settleReset(true)
      if ((event as InputEvent).isComposing) { if (!composing) composition++; composing = true }
      generation++; draftDirty = true; refresh()
    })
    listen(hex, "compositionstart", () => { settleReset(); generation++; composition++; composing = true; refresh() })
    listen(hex, "compositionend", () => {
      settleReset(true); generation++; composing = false; fenced = true; draftDirty = true
      const version = ++composition; refresh()
      later(() => { if (composition === version) { fenced = false; refresh() } })
    })
    const applyDraft = () => { if (!commit() && editable()) hex.reportValidity() }
    listen(hex, "keydown", event => {
      const key = event as KeyboardEvent
      if (key.key !== "Enter" || key.defaultPrevented) return
      key.preventDefault()
      if (key.isComposing || composing || fenced || key.repeat || key.altKey || key.ctrlKey || key.metaKey || key.shiftKey || apply!.matches(":disabled")) return
      const value = hex.value, current = control.value, version = generation
      later(() => { if (generation === version && hex.value === value && control.value === current) applyDraft() })
    })
    listen(apply!, "click", event => {
      const value = hex.value, current = control.value, version = generation
      later(() => { if (!event.defaultPrevented && generation === version && hex.value === value && control.value === current && shown(apply!) && !apply!.matches(":disabled")) applyDraft() })
    })
    if (revert) listen(revert, "click", event => {
      const value = hex.value, version = generation
      later(() => { if (!event.defaultPrevented && generation === version && hex.value === value && shown(revert) && !revert.matches(":disabled")) restoreDraft() })
    })
  }
  listen(document!, "reset", event => {
    if (event.target !== control.form && (!hex || event.target !== hex.form)) return
    settleReset()
    const previous = { event, composition }; reset = previous
    later(() => {
      if (!connected || reset !== previous) return
      try { if (settleReset()) refresh() } catch (reason) { if (connected) { disconnect(); fail(reason) } }
    })
  }, true)
  try { refresh() } catch (reason) { disconnect(); throw reason }
  return api
}
