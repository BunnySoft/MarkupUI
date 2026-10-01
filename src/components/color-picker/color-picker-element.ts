import { ViewElement } from "../../core/index.js"
import { createColorPicker } from "./color-picker.js"
import type { ColorPickerController } from "./color-picker.js"
import { colorModes, parseColor, serializeColor, validateSettings } from "./model.js"
import type { ColorMode, ColorPickerOptions, ColorPickerSettings } from "./model.js"

/**
 * Bounded sRGB color editing with native RGB, text, mode and alpha controls.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Error","web":"m:color-picker-error","bubbles":false,"cancelable":false,"composed":false,"detail":{"error":"unknown"}}
 * @region {"name":"content","accepts":["input","phrasing"],"min":0,"max":null}
 */
export class ColorPicker extends ViewElement {
  public static readonly tag = "m-color-picker"
  public static readonly observedAttributes = ["value", "disabled", "readonly", "required", "show-alpha", "modes", "mode", "name", "form"]
  private initialized = false
  private mapping = false
  private controller: ColorPickerController | undefined
  private pending: ColorPickerOptions = {}

  public connectedCallback(): void {
    if (!this.initialized) { this.initialized = true; this.upgradeProperties() }
    this.classList.add("m-color-picker")
    const controls = [...this.querySelectorAll<HTMLInputElement>('input[type="color"]')].filter(node => node.closest("m-color-picker") === this)
    if (controls.length > 1) throw new TypeError("Author at most one native RGB control.")
    const control = controls[0]
    if (control && !control.labels?.length && !control.hasAttribute("aria-label") && !control.hasAttribute("aria-labelledby")) {
      const label = this.ownerDocument.createElement("label")
      control.before(label); label.append("Color", control)
    }
    if (this.controller) this.controller.reconnect()
    else { this.controller = createColorPicker(this, this.pending); this.pending = {} }
    this.native.classList.add("m-color-picker__control")
    this.controller.hex.classList.add("m-color-picker__hex")
    this.querySelector("[data-color-entry]")?.classList.add("m-color-picker__entry")
    this.querySelector("[data-color-output]")?.classList.add("m-color-picker__output")
  }

  public disconnectedCallback(): void { this.controller?.disconnect() }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || this.mapping || !this.controller) return
    if (name === "value") this.controller.configure({ defaultValue: newValue ?? "#000000" })
    else this.controller.configure(this.markupSettings())
  }

  /** Committed string: empty, lowercase #rrggbb, or rgba(r, g, b, a). Silent writes do not replace a dirty draft. */
  public get value(): string { return this.controller?.value ?? this.pending.value ?? this.defaultValue }
  public set value(value: string) {
    const canonical = serializeColor(parseColor(value))
    if (this.controller) this.controller.setValue(canonical)
    else this.pending.value = canonical
  }
  /** Initial black unless authored; native-like defaults update clean values, not dirty values. The value attribute is the default, not live state. */
  public get defaultValue(): string { return this.controller?.defaultValue ?? this.markupDefault() }
  public set defaultValue(value: string) {
    const canonical = serializeColor(parseColor(value))
    if (this.controller) this.controller.configure({ defaultValue: canonical })
    this.mapping = true
    try { this.setAttribute("value", canonical) } finally { this.mapping = false }
  }
  /** Selected-mode display; HEX projects RGB only, with alpha represented independently. */
  public get formattedValue(): string { return this.requireOwner().formattedValue }
  /** Uncommitted text, including invalid/incomplete user input. */
  public get draft(): string { return this.requireOwner().draft }
  /** Whether the text/alpha draft differs from its last synchronized committed representation. */
  public get dirty(): boolean { return this.controller?.dirty ?? false }
  /** Native-like live-value dirty flag, distinct from draft dirtiness; cleared by an uncancelled reset. */
  public get valueDirty(): boolean { return this.controller?.valueDirty ?? false }
  /** Actual native RGB editing/focus owner; transparency is never sent through input[type=color]. */
  public get native(): HTMLInputElement { return this.requireOwner().control }
  /** Native alpha range (0..1, step .001); hidden unless showAlpha. */
  public get alphaControl(): HTMLInputElement { return this.requireOwner().alpha }
  /** Actual native text draft and constraint-validation owner. */
  public get draftControl(): HTMLInputElement { return this.requireOwner().hex }
  public get disabled(): boolean { return this.controller?.settings.disabled ?? this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.configure({ disabled: value }) }
  public get readOnly(): boolean { return this.controller?.settings.readOnly ?? this.hasAttribute("readonly") }
  public set readOnly(value: boolean) { this.configure({ readOnly: value }) }
  public get required(): boolean { return this.controller?.settings.required ?? this.hasAttribute("required") }
  public set required(value: boolean) { this.configure({ required: value }) }
  /** Shows a real cross-browser alpha editor; hiding it preserves committed and draft alpha. */
  public get showAlpha(): boolean { return this.controller?.settings.showAlpha ?? this.hasAttribute("show-alpha") }
  public set showAlpha(value: boolean) { this.configure({ showAlpha: value }) }
  /** Nonempty unique subset of hex/rgb/hsl. Updates retain controls, value, defaults and drafts. */
  public get modes(): readonly ColorMode[] { return this.controller?.settings.modes ?? this.markupSettings().modes }
  public set modes(value: readonly ColorMode[]) { this.configure({ modes: value }) }
  /** Actual text-editing mode, always a member of modes; invalid dirty text survives mode changes for deliberate restore/edit. */
  public get mode(): ColorMode { return this.controller?.settings.mode ?? this.markupSettings().mode }
  public set mode(value: ColorMode) { this.configure({ mode: value }) }
  /** One canonical successful hidden field; neither RGB nor auxiliary fields duplicate this name. */
  public get name(): string { return this.controller?.settings.name ?? this.getAttribute("name") ?? "" }
  public set name(value: string) { this.configure({ name: value }) }
  public get form(): HTMLFormElement | null { return this.controller?.submission.form ?? null }
  public get labels(): NodeListOf<HTMLLabelElement> | null { return this.native.labels }

  /** Preflights the complete typed record before any state, attribute or control mutation. */
  public configure(options: ColorPickerOptions): void {
    const before = this.controller?.settings ?? this.markupSettings()
    const next = validateSettings(options, before)
    if (options.value !== undefined) parseColor(options.value)
    if (options.defaultValue !== undefined) parseColor(options.defaultValue)
    if (this.controller) this.controller.configure(options)
    else if (options.value !== undefined) this.pending.value = serializeColor(parseColor(options.value))
    this.mapping = true
    try {
      for (const [key, name] of [["disabled", "disabled"], ["readOnly", "readonly"], ["required", "required"], ["showAlpha", "show-alpha"]] as const) this.toggleAttribute(name, next[key])
      this.setAttribute("modes", next.modes.join(",")); this.setAttribute("mode", next.mode)
      if (next.name) this.setAttribute("name", next.name); else this.removeAttribute("name")
      if (next.form === null) this.removeAttribute("form"); else this.setAttribute("form", next.form)
      if (options.defaultValue !== undefined) this.setAttribute("value", serializeColor(parseColor(options.defaultValue)))
    } finally { this.mapping = false }
  }
  public commit(): boolean { return this.requireOwner().commit() }
  public clear(): boolean { return this.requireOwner().clear() }
  public restoreDraft(): void { this.requireOwner().restoreDraft() }
  public checkValidity(): boolean { return this.draftControl.checkValidity() && this.native.checkValidity() }
  public reportValidity(): boolean { return this.draftControl.reportValidity() && this.native.reportValidity() }
  public override focus(options?: FocusOptions): void { this.native.focus(options) }
  public override blur(): void {
    const active = this.ownerDocument.activeElement
    if (active instanceof HTMLElement && this.contains(active)) active.blur()
  }
  private requireOwner(): ColorPickerController {
    if (!this.controller) throw new Error("Connect ColorPicker before accessing native controls or actions.")
    return this.controller
  }
  private markupDefault(): string { return serializeColor(parseColor(this.getAttribute("value") ?? "#000000")) }
  private markupSettings(): ColorPickerSettings {
    return validateSettings({
      modes: this.hasAttribute("modes") ? this.getAttribute("modes")!.split(",") as ColorMode[] : colorModes,
      mode: (this.getAttribute("mode") ?? (this.getAttribute("modes")?.split(",")[0] ?? "hex")) as ColorMode,
      showAlpha: this.hasAttribute("show-alpha"), disabled: this.hasAttribute("disabled"), readOnly: this.hasAttribute("readonly"),
      required: this.hasAttribute("required"), name: this.getAttribute("name") ?? "", form: this.getAttribute("form"),
    }, { modes: colorModes, mode: "hex", showAlpha: false, disabled: false, readOnly: false, required: false, name: "", form: null })
  }
}
