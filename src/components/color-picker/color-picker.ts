import { colorModes, formatColor, parseColor, rgbHex, serializeColor, validateSettings } from "./model.js"
import type { Color, ColorPickerOptions, ColorPickerSettings } from "./model.js"
import { mapColorPicker } from "./native.js"

export interface ColorPickerController {
  readonly control: HTMLInputElement
  readonly hex: HTMLInputElement
  readonly alpha: HTMLInputElement
  readonly modeControl: HTMLSelectElement
  readonly submission: HTMLInputElement
  readonly value: string
  readonly defaultValue: string
  readonly formattedValue: string
  readonly draft: string
  readonly dirty: boolean
  readonly valueDirty: boolean
  readonly settings: ColorPickerSettings
  readonly connected: boolean
  readonly error: unknown
  configure(options: ColorPickerOptions): void
  setValue(value: string): void
  clear(): boolean
  commit(): boolean
  restoreDraft(): void
  refresh(): void
  reconnect(): void
  disconnect(): void
}
interface Attribute { node: HTMLElement; name: string; before: string | null; base: string | null; last: string | null }
const owner = Symbol.for("markup-ui.color-picker.owner")
type Owned = Element & { [owner]?: ColorPickerController }
const classic = (value: string) => /^#[\da-f]{6}$/i.test(value)

/** The sole bounded color, draft, defaults, forms and lifecycle owner for both Web entry points. */
export function createColorPicker(root: HTMLElement, options: ColorPickerOptions = {}): ColorPickerController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches("[data-color-picker], m-color-picker")) throw new TypeError("Color Picker needs a native data-color-picker root or m-color-picker.")
  if ((root as Owned)[owner]) throw new Error("Color Picker node already has an owner.")
  const own = (node: Element) => node.closest("[data-color-picker], m-color-picker") === root
  const original = [...root.querySelectorAll<HTMLInputElement>("input[data-color-control], input[type=color]")].filter(own)
  if (original.length > 1) throw new TypeError("Author one native color control.")
  const originalControl = original[0]
  if (originalControl && (!classic(originalControl.value) || originalControl.hasAttribute("value") && !classic(originalControl.defaultValue)
    || originalControl.hasAttribute("alpha") || originalControl.hasAttribute("colorspace"))) throw new TypeError("Native RGB control must retain classic #RRGGBB; alpha uses the separate logical field.")
  const existingSubmission = root.querySelector<HTMLInputElement>("input[data-color-value]")
  const initial = parseColor(options.value !== undefined ? options.value : existingSubmission?.value ?? root.getAttribute("value") ?? originalControl?.value ?? "#000000")
  const initialDefault = parseColor(options.defaultValue !== undefined ? options.defaultValue : existingSubmission?.defaultValue ?? root.getAttribute("value") ?? originalControl?.getAttribute("value") ?? "#000000")
  let settings = validateSettings(options, {
    modes: root.hasAttribute("modes") ? root.getAttribute("modes")!.split(",") as ColorPickerSettings["modes"] : colorModes,
    mode: (root.getAttribute("mode") ?? "hex") as ColorPickerSettings["mode"], showAlpha: root.hasAttribute("show-alpha"),
    disabled: root.hasAttribute("disabled") || !!originalControl?.disabled, readOnly: root.hasAttribute("readonly") || !!originalControl?.readOnly,
    required: root.hasAttribute("required") || !!originalControl?.required,
    name: root.getAttribute("name") ?? (existingSubmission?.hasAttribute("name") ? existingSubmission.name : undefined) ?? originalControl?.name ?? "",
    form: root.getAttribute("form") ?? originalControl?.getAttribute("form") ?? null,
  })
  let current: Color | null = initial, defaultColor: Color | null = initialDefault, valueDirty = options.value !== undefined || serializeColor(initial) !== serializeColor(initialDefault)
  const { control, hex, entry, output, apply, revert, clear, alpha, mode, submission } = mapColorPicker(root)
  const alphaLabel = alpha.parentElement?.matches("[data-color-alpha-label]") ? alpha.parentElement : null
  const nodes = [root, control, hex, entry, output, apply, revert, clear, alpha, mode, submission, ...(alphaLabel ? [alphaLabel] : [])]
  for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Color Picker node already has an owner.")
  function named(node: HTMLInputElement | HTMLButtonElement | HTMLSelectElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim()
      || [...node.labels ?? []].some(label => label.textContent?.trim()) || node.localName === "button" && node.textContent?.trim())
  }
  function anatomy() {
    for (const node of nodes) if (node !== root && (!root.contains(node) || !own(node))) throw new TypeError("Keep the original ColorPicker controls and mappings.")
    for (const [part, node] of Object.entries({ control, hex, entry, output, apply, revert, clear, alpha, mode, value: submission })) {
      const matches = [...root.querySelectorAll(`[data-color-${part}]`)].filter(own)
      if (matches.length !== 1 || matches[0] !== node) throw new TypeError(`Keep one original data-color-${part}.`)
    }
    if (!root.isConnected || root.getRootNode() !== document || root.closest("label, button, a[href], summary")
      || control.type !== "color" || !classic(control.value) || control.hasAttribute("value") && !classic(control.defaultValue)
      || control.hasAttribute("alpha") || control.hasAttribute("colorspace") || control.hasAttribute("role") || control.hidden
      || hex.type !== "text" || hex.hasAttribute("name") || !entry.contains(hex) || !entry.contains(apply) || !entry.contains(revert)
      || alpha.type !== "range" || alpha.min !== "0" || alpha.max !== "1" || alpha.step !== "0.001" || alpha.hasAttribute("name")
      || mode.hasAttribute("name") || submission.type !== "hidden" || control.hasAttribute("name")
      || [hex, alpha, mode, submission].some(node => node.form !== control.form)
      || [control, hex, alpha, mode, apply, revert, clear].some(node => !named(node) || node.hasAttribute("role") || node.getAttribute("aria-hidden") === "true")) {
      throw new TypeError("Use labelled native RGB, text, alpha range and mode fields sharing one native form owner.")
    }
    if (control.list && [...control.list.options].some(option => !classic(option.value))) throw new TypeError("Native datalist swatches must be literal six-digit RGB hex values.")
    for (const button of [apply, revert, clear]) if (button.type !== "button" || button.hasAttribute("popovertarget") || button.hasAttribute("commandfor")
      || button.parentElement?.closest("label, button, a[href], summary")
      || button.querySelector("input, button, select, textarea, a[href], [tabindex], [contenteditable], [role]")) throw new TypeError("Color actions must be separate labelled type=button controls.")
    if (!["span", "p"].includes(output.localName) || output.children.length || output.hasAttribute("role") || output.hasAttribute("aria-live")
      || output.hasAttribute("tabindex") || output.isContentEditable
      || output.closest('label, button, a[href], [aria-live]:not([aria-live="off" i]), [role~="alert" i], [role~="status" i], [role~="log" i]')) throw new TypeError("The color readout must be separate plain nonlive text.")
  }
  let connected = false, composing = false, fenced = false, composition = 0, generation = 0, error: unknown = null
  let reset: { event: Event; composition: number } | null = null
  const generated = new WeakSet<Event>()
  let lastText = formatColor(current, settings.mode), draftDirty = hex.value !== "" && hex.value !== lastText, alphaDirty = false
  const attributes: Attribute[] = [], removers: (() => void)[] = [], tasks = new Set<number>()
  let outputBefore = output.textContent ?? "", outputLast = outputBefore, ownedValidity = ""
  function lease(node: HTMLElement, name: string, enhance = false) {
    const before = node.getAttribute(name)
    attributes.push({ node, name, before, base: enhance ? null : before, last: before })
  }
  for (const node of [entry, output, apply, revert, clear, alpha]) lease(node, "hidden", true)
  if (alphaLabel) lease(alphaLabel, "hidden", true)
  for (const node of [control, hex, alpha, mode, submission, apply, revert, clear]) {
    lease(node, "disabled", node === hex)
    if ("form" in node) lease(node, "form")
  }
  for (const name of ["name", "readonly", "required"]) lease(control, name)
  for (const name of ["readonly", "required", "pattern", "maxlength"]) lease(hex, name)
  lease(submission, "name")
  function attribute(node: HTMLElement, name: string) { return attributes.find(item => item.node === node && item.name === name)! }
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const item = attributes.find(item => item.node === record.target && item.name === record.attributeName)
      if (item) item.before = item.base = item.last = item.node.getAttribute(item.name)
      if (record.target === control && record.attributeName === "disabled") settings = { ...settings, disabled: control.disabled }
      if (record.target === control && record.attributeName === "readonly") settings = { ...settings, readOnly: control.readOnly }
      if (record.target === control && record.attributeName === "required") settings = { ...settings, required: control.required }
    }
  }
  function write(node: HTMLElement, name: string, value: string | null) {
    if (node.getAttribute(name) !== value) {
      if (value === null) node.removeAttribute(name)
      else node.setAttribute(name, value)
    }
    attribute(node, name).last = value
  }
  function shown(node: HTMLElement) {
    if (!node.isConnected || node.closest("[hidden], [inert]")) return false
    for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
      const style = view!.getComputedStyle(parent)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function editable() { return shown(hex) && !hex.matches(":disabled") && !hex.readOnly && !composing && !fenced }
  function usableColor() { return shown(control) && !control.matches(":disabled") && !settings.readOnly }
  function dirty() { return draftDirty || hex.value !== lastText }
  function syncText(value: string) {
    if (hex.value === value) { lastText = value; return }
    const selected = document!.activeElement === hex ? [hex.selectionStart, hex.selectionEnd, hex.selectionDirection] as const : null
    hex.value = value; lastText = value
    if (selected && selected[0] !== null && selected[1] !== null) hex.setSelectionRange(selected[0], selected[1], selected[2] ?? undefined)
  }
  function validity(message: string) {
    if (!hex.willValidate) return
    if (!hex.validity.customError || hex.validationMessage === ownedValidity) { hex.setCustomValidity(message); ownedValidity = message }
  }
  function draftColor(): Color | null {
    if (hex.value === lastText) return current ? { ...current, a: settings.showAlpha || alphaDirty ? Number(alpha.value) : current.a } : null
    const parsed = parseColor(hex.value)
    if (hex.value && settings.mode === "hex" && !/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(hex.value)
      || hex.value && settings.mode === "rgb" && !/^rgba?\(/i.test(hex.value)
      || hex.value && settings.mode === "hsl" && !/^hsla?\(/i.test(hex.value)) throw new TypeError(`Draft must use ${settings.mode} syntax.`)
    // Six-digit HEX projects RGB only; its independent alpha control retains transparency.
    if (parsed && /^#[\da-f]{6}$/i.test(hex.value)) parsed.a = settings.showAlpha ? Number(alpha.value) : current?.a ?? 1
    if (parsed && alphaDirty) parsed.a = Number(alpha.value)
    return parsed
  }
  function validateDraft(forCommit = false) {
    try { const candidate = draftColor(); validity(settings.required && !(forCommit ? candidate : current) ? "Choose and apply a color." : "") }
    catch (reason) { if (!(reason instanceof TypeError || reason instanceof RangeError)) throw reason; validity(reason.message) }
  }
  function syncDefaults() {
    const text = hex.value, opacity = alpha.value
    const selection = document!.activeElement === hex ? [hex.selectionStart, hex.selectionEnd, hex.selectionDirection] as const : null
    submission.defaultValue = serializeColor(defaultColor)
    control.defaultValue = defaultColor ? rgbHex(defaultColor) : "#000000"
    hex.defaultValue = formatColor(defaultColor, settings.mode)
    alpha.defaultValue = String(defaultColor?.a ?? 1)
    if (hex.value !== text) hex.value = text
    if (alpha.value !== opacity) alpha.value = opacity
    if (selection && selection[0] !== null && selection[1] !== null) hex.setSelectionRange(selection[0], selection[1], selection[2] ?? undefined)
  }
  function synchronize() {
    const previous = document!.activeElement
    if (hex.value !== lastText) draftDirty = true
    for (const node of [entry, output, apply, revert, clear]) write(node, "hidden", attribute(node, "hidden").base)
    write(alpha, "hidden", settings.showAlpha ? attribute(alpha, "hidden").base : "")
    if (alphaLabel) write(alphaLabel, "hidden", settings.showAlpha ? attribute(alphaLabel, "hidden").base : "")
    for (const node of [control, hex, alpha, mode, submission, apply, revert, clear]) {
      const item = attribute(node, "disabled")
      const locked = settings.disabled || node !== submission && (node === control || node === alpha || node === mode || node instanceof view!.HTMLButtonElement) && settings.readOnly
      write(node, "disabled", locked || node === hex && !shown(hex) ? "" : item.base)
    }
    write(control, "name", null); write(control, "readonly", null); write(control, "required", null)
    write(submission, "name", settings.name || null)
    write(hex, "readonly", settings.readOnly ? "" : attribute(hex, "readonly").base)
    write(hex, "required", settings.required ? "" : null)
    write(hex, "pattern", null); write(hex, "maxlength", null)
    for (const button of [apply, revert, clear]) write(button, "disabled", editable() ? attribute(button, "disabled").base : "")
    if (!dirty() && !composing) { syncText(formatColor(current, settings.mode)); alpha.value = String(current?.a ?? 1) }
    control.value = current ? rgbHex(current) : "#000000"
    if (submission.value !== serializeColor(current)) submission.value = serializeColor(current)
    if ([...mode.options].map(option => option.value).join(",") !== settings.modes.join(",")) {
      const options = settings.modes.map(value => {
        const old = [...mode.options].find(option => option.value === value)
        if (old) return old
        const option = document!.createElement("option"); option.value = value; option.textContent = value.toUpperCase(); return option
      })
      mode.replaceChildren(...options)
    }
    mode.value = settings.mode
    for (const option of mode.options) option.defaultSelected = option.value === settings.mode
    if (output.textContent !== outputLast) outputBefore = output.textContent ?? ""
    if (output.textContent !== serializeColor(current)) output.textContent = serializeColor(current)
    outputLast = output.textContent ?? ""
    validateDraft()
    anatomy()
    if (previous instanceof view!.HTMLElement && [hex, alpha, mode, apply, revert, clear].includes(previous as HTMLInputElement)
      && (!shown(previous) || previous.matches(":disabled")) && (document!.activeElement === previous || document!.activeElement === document!.body)) {
      if (editable()) hex.focus({ preventScroll: true })
      else if (usableColor()) control.focus({ preventScroll: true })
      else if (document!.activeElement === previous) previous.blur()
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    try { refresh() } catch (reason) { if (connected) withdraw(reason) }
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (connected) observer.observe(document!, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["type", "alpha", "colorspace", "readonly", "required", "value", "disabled", "hidden", "inert", "form", "id",
        "list", "pattern", "maxlength", "name", "role", "aria-live", "aria-label", "aria-labelledby", "class", "style", "tabindex", "contenteditable",
        "data-color-control", "data-color-hex", "data-color-alpha", "data-color-mode", "data-color-value", "min", "max", "step"] })
  }
  function withdraw(reason: unknown) {
    disconnect(); error = reason
    root.dispatchEvent(new view!.CustomEvent("m:color-picker-error", { detail: { error: reason } }))
  }
  function settleReset(preserveDraft = false) {
    const previous = reset
    if (!previous || previous.event.eventPhase !== 0) return false
    reset = null
    if (previous.event.defaultPrevented) return false
    if (composition === previous.composition) { composing = false; fenced = false }
    generation++; current = defaultColor; valueDirty = false; alphaDirty = false
    draftDirty = preserveDraft || hex.value !== hex.defaultValue
    if (!draftDirty) lastText = hex.value
    return true
  }
  function refresh() {
    if (!connected) return
    settleReset(); pause()
    try {
      if (submission.hasAttribute("data-color-generated") && submission.previousElementSibling !== control) control.after(submission)
      for (const node of [hex, alpha, mode, submission, apply, revert, clear]) if (node.hasAttribute("data-color-generated")) write(node, "form", control.getAttribute("form"))
      anatomy(); synchronize(); error = null
    }
    catch (reason) { withdraw(reason); throw reason }
    finally { observe() }
  }
  function ensure() {
    if (!connected) throw new Error("Color Picker is disconnected.")
    if (settleReset()) refresh()
    anatomy()
  }
  function configure(next: ColorPickerOptions) {
    const prepared = validateSettings(next, settings)
    const value = next.value === undefined ? current : parseColor(next.value)
    const fallback = next.defaultValue === undefined ? defaultColor : parseColor(next.defaultValue)
    if (!connected) {
      generation++; settings = prepared
      if (next.value !== undefined) { current = value; valueDirty = true }
      if (next.defaultValue !== undefined) { defaultColor = fallback; if (!valueDirty) current = fallback }
      return
    }
    ensure(); pause(); generation++
    try {
      const cleanText = hex.value === lastText && !composing
      const modeChanged = settings.mode !== prepared.mode
      settings = prepared
      if (next.form !== undefined) for (const node of [control, hex, alpha, mode, submission, apply, revert, clear]) write(node, "form", settings.form)
      if (next.value !== undefined) { current = value; valueDirty = true }
      if (next.defaultValue !== undefined) { defaultColor = fallback; if (!valueDirty) current = fallback; syncDefaults() }
      else if (modeChanged) syncDefaults()
      if (modeChanged && cleanText) syncText(formatColor(current, settings.mode))
      for (const node of [control, hex, alpha, mode, submission, apply, revert, clear]) if (next.disabled !== undefined) attribute(node, "disabled").base = null
      if (next.readOnly !== undefined) attribute(hex, "readonly").base = null
      synchronize()
    } finally { observe() }
  }
  function setValue(value: string) { parseColor(value); configure({ value }) }
  function restoreDraft() {
    ensure()
    if (composing || fenced) throw new view!.DOMException("Finish composition before replacing the draft.", "InvalidStateError")
    generation++; pause()
    try { draftDirty = false; alphaDirty = false; syncText(formatColor(current, settings.mode)); alpha.value = String(current?.a ?? 1); synchronize() } finally { observe() }
  }
  function notify(before: string) {
    const target = serializeColor(current), version = generation
    if (before === target) return
    const input = new view!.Event("input", { bubbles: true, composed: true }); generated.add(input); control.dispatchEvent(input)
    if (!connected || generation !== version || serializeColor(current) !== target) return
    root.dispatchEvent(new view!.CustomEvent("m:change", { detail: { value: target }, bubbles: true }))
    if (!connected || generation !== version || serializeColor(current) !== target) return
    const change = new view!.Event("change", { bubbles: true }); generated.add(change); control.dispatchEvent(change)
  }
  function commit() {
    ensure()
    if (!editable() || !usableColor()) return false
    validateDraft(true)
    if (!hex.validity.valid || (settings.showAlpha || alphaDirty) && !alpha.validity.valid) { validateDraft(); return false }
    const target = draftColor(), before = serializeColor(current)
    generation++; current = target; valueDirty = true; restoreDraft(); notify(before)
    return true
  }
  function clearValue() {
    ensure()
    if (!editable() || !usableColor()) return false
    const before = serializeColor(current)
    generation++; current = null; valueDirty = true; restoreDraft(); notify(before); return true
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
    pause(); connected = false; generation++; reset = null; composing = false; fenced = false; composition++
    removers.splice(0).forEach(remove => remove()); tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    if (ownedValidity && hex.willValidate && hex.validationMessage === ownedValidity) hex.setCustomValidity("")
    for (const item of attributes) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    if (output.textContent === outputLast) output.textContent = outputBefore
    for (const node of nodes) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
    if (previous instanceof view!.HTMLElement && [hex, alpha, mode, apply, revert, clear].includes(previous as HTMLInputElement)
      && (!shown(previous) || previous.matches(":disabled")) && (document!.activeElement === previous || document!.activeElement === document!.body)) {
      if (usableColor()) control.focus({ preventScroll: true })
      else if (document!.activeElement === previous) previous.blur()
    }
  }
  const api: ColorPickerController = {
    control, hex, alpha, modeControl: mode, submission,
    get value() { if (connected) ensure(); return serializeColor(current) },
    get defaultValue() { return serializeColor(defaultColor) }, get formattedValue() { return formatColor(current, settings.mode) },
    get draft() { return hex.value }, get dirty() { return dirty() }, get valueDirty() { return valueDirty },
    get settings() { return { ...settings, modes: Object.freeze([...settings.modes]) } }, get connected() { return connected }, get error() { return error },
    configure, setValue, clear: clearValue, commit, restoreDraft, refresh, reconnect, disconnect,
  }
  function reconnect() {
    if (connected) return
    for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Color Picker node already has an owner.")
    if (!root.isConnected) throw new Error("Connect ColorPicker before reconnecting its owner.")
    connected = true; generation++
    for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
    pause()
    try {
      for (const node of [control, hex, alpha, mode, submission, apply, revert, clear]) write(node, "form", settings.form)
      syncDefaults(); if (!draftDirty) syncText(formatColor(current, settings.mode)); synchronize()
    } catch (reason) { withdraw(reason); throw reason } finally { observe() }
    bind()
  }
  function bind() {
    for (const type of ["input", "change"]) listen(control, type, event => {
      if (generated.has(event)) return
      try {
        settleReset()
        const before = serializeColor(current), accepted = usableColor()
        if (accepted) {
          const next = parseColor(control.value)!; next.a = current?.a ?? 1
          generation++; current = next; valueDirty = true
        }
        refresh()
        if (accepted && before !== serializeColor(current)) root.dispatchEvent(new view!.CustomEvent("m:change", { detail: { value: serializeColor(current) }, bubbles: true }))
      } catch (reason) { if (connected) withdraw(reason) }
    })
    listen(hex, "input", event => {
      settleReset(true)
      if ((event as InputEvent).isComposing) { if (!composing) composition++; composing = true }
      generation++; draftDirty = true; refresh()
    })
    listen(alpha, "input", () => { settleReset(true); generation++; draftDirty = true; alphaDirty = true; refresh() })
    listen(alpha, "change", event => {
      const version = generation, text = hex.value, value = alpha.value
      later(() => { if (!event.defaultPrevented && generation === version && hex.value === text && alpha.value === value) commit() })
    })
    listen(mode, "change", () => {
      if (!shown(mode) || mode.matches(":disabled") || settings.readOnly) { refresh(); return }
      configure({ mode: mode.value as ColorPickerSettings["mode"] })
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
      if (key.isComposing || composing || fenced || key.repeat || key.altKey || key.ctrlKey || key.metaKey || key.shiftKey || apply.matches(":disabled")) return
      const text = hex.value, value = serializeColor(current), version = generation
      later(() => { if (generation === version && hex.value === text && serializeColor(current) === value) applyDraft() })
    })
    for (const [button, action] of [[apply, applyDraft], [revert, restoreDraft], [clear, clearValue]] as const) listen(button, "click", event => {
      const text = hex.value, value = alpha.value, version = generation
      later(() => { if (!event.defaultPrevented && generation === version && hex.value === text && alpha.value === value && shown(button) && !button.matches(":disabled")) action() })
    })
    listen(document!, "reset", event => {
      if (event.target !== control.form) return
      settleReset()
      const previous = { event, composition }; reset = previous
      later(() => { if (reset === previous) { try { if (settleReset()) refresh() } catch (reason) { if (connected) withdraw(reason) } } })
    }, true)
  }
  reconnect()
  return api
}
