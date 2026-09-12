import { ViewElement } from "../../core/index.js"
import { createInput } from "../native-input.js"
import type { InputControl, InputController, InputCount } from "../native-input.js"

export type InputType = "text" | "password" | "search" | "email" | "tel" | "url"
export type InputSize = "tiny" | "small" | "medium" | "large"
export type InputStatus = "success" | "warning" | "error"
const types = ["text", "password", "search", "email", "tel", "url"] as const
const sizes = ["tiny", "small", "medium", "large"] as const
const statuses = ["success", "warning", "error"] as const

function text(value: string): void {
  if (typeof value !== "string") throw new TypeError("Expected a string.")
}
function length(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 2147483647) throw new RangeError("Expected a nonnegative 32-bit integer.")
}

/** Shared native editing mechanics, not a property dispatcher or form engine. */
abstract class NativeField extends ViewElement {
  private control?: InputControl
  private controller: InputController | undefined
  private initialized = false
  private observer?: MutationObserver
  private generated = new Map<string, HTMLElement>()
  private anatomy: Element[] = []
  private formatter: ((count: InputCount) => string) | undefined
  private generation = 0
  private autosizeOwned = false

  public connectedCallback(): void {
    const generation = ++this.generation
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    queueMicrotask(() => { if (this.isConnected && generation === this.generation) this.refresh() })
  }
  public disconnectedCallback(): void {
    this.generation++
    this.observer?.disconnect()
    this.controller?.disconnect()
    this.controller = undefined
  }
  public attributeChangedCallback(name: string): void {
    if (!this.initialized && !this.control) return
    if (["size", "status", "round", "borderless", "clearable", "show-password", "show-count", "autosize"].includes(name)) {
      if (this.initialized && this.isConnected) this.refresh()
    } else {
      const control = this.field()
      this.forward(control, name)
      this.controller?.refresh()
    }
  }
  protected field(): InputControl {
    const kind = this.localName === "m-textarea" ? "textarea" : "input"
    const fields = [...this.querySelectorAll<InputControl>("input,textarea")].filter(node => node.closest("m-input,m-textarea") === this)
    if (fields.length > 1 || fields[0] && fields[0].localName !== kind) throw new TypeError(`Expected one native ${kind}.`)
    if (this.control && this.contains(this.control)) return this.control
    const control = fields[0] ?? this.ownerDocument.createElement(kind)
    if (kind === "input" && !types.includes((this.getAttribute("type") ?? control.getAttribute("type")?.toLowerCase() ?? "text") as InputType)) throw new RangeError("Unsupported Input type.")
    const attributes = ["value", "name", "placeholder", "disabled", "readonly", "required", "minlength", "maxlength", "form", "autocomplete", "inputmode", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", ...(kind === "input" ? ["pattern", "type"] : ["rows", "cols", "wrap"])]
    for (const name of attributes) this.validateAttribute(name, this.getAttribute(name))
    this.control = control
    for (const name of attributes) if (this.hasAttribute(name)) this.forward(control, name)
    control.setAttribute("data-input-control", "")
    if (!fields.length) this.append(control)
    return control
  }
  private validateAttribute(name: string, value: string | null): void {
    if (name === "type" && value !== null && !types.includes(value as InputType)) throw new RangeError("Unsupported Input type.")
    if (name === "minlength" || name === "maxlength" || name === "rows" || name === "cols") {
      if (value !== null) {
        if (!value.trim()) throw new RangeError(`Invalid ${name}.`)
        length(Number(value))
        if ((name === "rows" || name === "cols") && Number(value) === 0) throw new RangeError(`Invalid ${name}.`)
      }
    }
  }
  private forward(control: InputControl, name: string): void {
    const value = this.getAttribute(name)
    this.validateAttribute(name, value)
    if (name === "value" && control instanceof HTMLTextAreaElement) control.defaultValue = value ?? ""
    else if (value === null) control.removeAttribute(name)
    else control.setAttribute(name, value)
  }
  /** Live native value. Silent writes leave defaultValue and the host value attribute unchanged. */
  public get value(): string { return this.field().value }
  public set value(value: string) {
    text(value)
    if (this.controller?.connected) this.controller.setValue(value)
    else this.field().value = value
  }
  /** Native reset default; changing it follows the native dirty-value flag, without input/change events. */
  public get defaultValue(): string { return this.field().defaultValue }
  public set defaultValue(value: string) { text(value); this.field().defaultValue = value; this.controller?.refresh() }
  /** Native name; only the native control participates in FormData. */
  public get name(): string { return this.field().name }
  public set name(value: string) { text(value); this.field().name = value }
  public get placeholder(): string { return this.field().placeholder }
  public set placeholder(value: string) { text(value); this.field().placeholder = value }
  /** Own disabled flag, not inherited fieldset disabledness. Use native.matches(":disabled") for effective state. */
  public get disabled(): boolean { return this.field().disabled }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value); this.field().disabled = value; this.controller?.refresh() }
  public get readOnly(): boolean { return this.field().readOnly }
  public set readOnly(value: boolean) { this.setBooleanAttribute("readonly", value); this.field().readOnly = value; this.controller?.refresh() }
  public get required(): boolean { return this.field().required }
  public set required(value: boolean) { this.setBooleanAttribute("required", value); this.field().required = value }
  /** Native -1 means no maximum; remove the maxlength attribute to restore absence. */
  public get maxLength(): number { return this.field().maxLength }
  public set maxLength(value: number) { length(value); this.field().maxLength = value; this.controller?.refresh() }
  /** Native -1 means no minimum; remove the minlength attribute to restore absence. */
  public get minLength(): number { return this.field().minLength }
  public set minLength(value: number) { length(value); this.field().minLength = value }
  public get form(): HTMLFormElement | null { return this.field().form }
  public get validity(): ValidityState { return this.field().validity }
  public get validationMessage(): string { return this.field().validationMessage }
  public get willValidate(): boolean { return this.field().willValidate }
  public get size(): InputSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: InputSize) { this.setChoiceAttribute("size", value, sizes) }
  public get status(): InputStatus | null { return this.choiceAttribute("status", statuses, null) }
  public set status(value: InputStatus | null) { this.setNullableChoiceAttribute("status", value, statuses) }
  public get borderless(): boolean { return this.hasAttribute("borderless") }
  public set borderless(value: boolean) { this.setBooleanAttribute("borderless", value) }
  public get clearable(): boolean { return this.hasAttribute("clearable") }
  public set clearable(value: boolean) { this.setBooleanAttribute("clearable", value) }
  public get showCount(): boolean { return this.hasAttribute("show-count") }
  public set showCount(value: boolean) { this.setBooleanAttribute("show-count", value) }
  /** Optional plain-text count formatter. Undefined restores UTF-16 length / native maximum. */
  public get formatCount(): ((count: InputCount) => string) | undefined { return this.formatter }
  public set formatCount(value: ((count: InputCount) => string) | undefined) {
    if (value !== undefined && typeof value !== "function") throw new TypeError("Expected a count formatter.")
    const control = this.control ?? this.querySelector<InputControl>("input,textarea")
    const current = control?.value ?? "", maxLength = control?.maxLength ?? -1
    if (value && typeof value({ value: current, length: current.length, maxLength: maxLength < 0 ? null : maxLength }) !== "string") throw new TypeError("Count must be plain text.")
    this.formatter = value
    this.controller?.disconnect()
    if (this.isConnected) this.refresh()
  }
  public override focus(options?: FocusOptions): void { this.field().focus(options) }
  public override blur(): void { this.field().blur() }
  public select(): void { this.field().select() }
  public setSelectionRange(start: number | null, end: number | null, direction?: "forward" | "backward" | "none"): void { this.field().setSelectionRange(start, end, direction) }
  public setRangeText(replacement: string): void
  public setRangeText(replacement: string, start: number, end: number, mode?: SelectionMode): void
  public setRangeText(replacement: string, start?: number, end?: number, mode?: SelectionMode): void {
    if (arguments.length === 1) this.field().setRangeText(replacement)
    else {
      if (arguments.length < 3) throw new TypeError("Provide both selection endpoints.")
      this.field().setRangeText(replacement, start!, end!, mode)
    }
    this.controller?.refresh()
  }
  public checkValidity(): boolean { return this.field().checkValidity() }
  public reportValidity(): boolean { return this.field().reportValidity() }
  public setCustomValidity(message: string): void { text(message); this.field().setCustomValidity(message) }
  /** User-intent action: input, then change, then m:input-clear({previous}), only when editable and nonempty. */
  public clear(): boolean { if (this.isConnected) this.refresh(); return this.controller?.clear() ?? false }
  /** Refresh decorations after direct native property writes; never changes native value or selection. */
  public refresh(): void {
    if (!this.isConnected) return
    const size = this.size, status = this.status
    if (this.hasAttribute("role") || this.hasAttribute("tabindex")) throw new TypeError("The native field owns semantics and focus.")
    const control = this.field()
    this.observer?.disconnect()
    this.classList.add("m-input")
    this.setAttribute("data-input", "")
    this.dataset.size = size
    if (status === null) delete this.dataset.status
    else this.dataset.status = status
    this.toggleAttribute("data-round", this.hasAttribute("round"))
    this.toggleAttribute("data-borderless", this.borderless)
    if (control.localName === "textarea") {
      if (this.hasAttribute("autosize") && !control.classList.contains("m-input__autosize")) {
        control.classList.add("m-input__autosize"); this.autosizeOwned = true
      } else if (!this.hasAttribute("autosize") && this.autosizeOwned) {
        control.classList.remove("m-input__autosize"); this.autosizeOwned = false
      }
    }
    for (const [part, enabled, label] of [
      ["clear", this.clearable, "Clear"],
      ["reveal", this.hasAttribute("show-password"), "Show password"],
      ["count", this.showCount, ""],
    ] as const) {
      const previous = this.generated.get(part)
      if (!enabled && previous) { previous.remove(); this.generated.delete(part) }
      if (enabled && !this.querySelector(`[data-input-${part}]`)) {
        const node = this.ownerDocument.createElement(part === "count" ? "span" : "button")
        node.setAttribute(`data-input-${part}`, "")
        node.textContent = label
        if (node instanceof HTMLButtonElement) { node.type = "button"; node.hidden = true }
        this.generated.set(part, node)
        this.append(node)
      }
    }
    const anatomy = this.parts()
    if (!this.controller?.connected || anatomy.length !== this.anatomy.length || anatomy.some((node, index) => node !== this.anatomy[index])) {
      const composing = this.controller?.composing ?? false
      this.controller?.disconnect()
      this.controller = createInput(this, this.formatter ? { formatCount: this.formatter } : {}, false, composing)
      this.anatomy = anatomy
    } else this.controller.refresh()
    this.observer ??= new MutationObserver(() => {
      const parts = this.parts()
      if (parts.length !== this.anatomy.length || parts.some((node, index) => node !== this.anatomy[index])) this.refresh()
    })
    this.observer.observe(this, { childList: true, subtree: true })
  }
  private parts(): Element[] { return [...this.querySelectorAll("input,textarea,[data-input-control],[data-input-clear],[data-input-reveal],[data-input-count]")] }
}

/**
 * Native text-family input, optionally with authored prefix/suffix and clear/reveal/count controls.
 * @region {"name":"content","accepts":["one native input","prefix/suffix phrasing","native action buttons","count span"],"min":0,"max":null}
 */
export class Input extends NativeField {
  public static readonly tag = "m-input"
  public static readonly observedAttributes: readonly string[] = ["value", "name", "placeholder", "disabled", "readonly", "required", "minlength", "maxlength", "form", "autocomplete", "inputmode", "pattern", "type", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", "size", "status", "round", "borderless", "clearable", "show-password", "show-count"]
  public get native(): HTMLInputElement { return this.field() as HTMLInputElement }
  /** Native type (text while revealed). Changing supported types retains the same native input. */
  public get type(): InputType {
    const value = this.native.getAttribute("type")?.toLowerCase() ?? "text"
    if (!types.includes(value as InputType)) throw new RangeError("Unsupported Input type.")
    return value as InputType
  }
  public set type(value: InputType) {
    if (!types.includes(value)) throw new RangeError("Unsupported Input type.")
    this.setStringAttribute("type", value)
    this.native.type = value
  }
  public get showPassword(): boolean { return this.hasAttribute("show-password") }
  public set showPassword(value: boolean) {
    if (value && this.native.type !== "password") throw new RangeError("Password reveal requires password type.")
    this.setBooleanAttribute("show-password", value)
  }
  public get round(): boolean { return this.hasAttribute("round") }
  public set round(value: boolean) { this.setBooleanAttribute("round", value) }
}

/**
 * Native multiline editing. Autosize uses CSS field-sizing; rows and vertical resize remain the fallback.
 * @region {"name":"content","accepts":["one native textarea","prefix/suffix phrasing","native clear button","count span"],"min":0,"max":null}
 */
export class Textarea extends NativeField {
  public static readonly tag = "m-textarea"
  public static readonly observedAttributes: readonly string[] = ["value", "name", "placeholder", "disabled", "readonly", "required", "minlength", "maxlength", "form", "autocomplete", "inputmode", "rows", "cols", "wrap", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", "size", "status", "borderless", "clearable", "show-count", "autosize"]
  public get native(): HTMLTextAreaElement { return this.field() as HTMLTextAreaElement }
  public get rows(): number { return this.native.rows }
  public set rows(value: number) { length(value); if (!value) throw new RangeError("Rows must be positive."); this.native.rows = value }
  public get autosize(): boolean { return this.hasAttribute("autosize") }
  public set autosize(value: boolean) { this.setBooleanAttribute("autosize", value) }
}

/** @region {"name":"content","accepts":["Input","Textarea","InputGroupLabel","native controls"],"min":0,"max":null} */
export class InputGroup extends ViewElement {
  public static readonly tag = "m-input-group"
  public static readonly observedAttributes = []
  public connectedCallback(): void { this.upgradeProperties(); this.classList.add("m-input-group") }
}

/**
 * Native labels inside this presentation region keep their own for association.
 * @region {"name":"content","accepts":["phrasing","native label"],"min":0,"max":null}
 */
export class InputGroupLabel extends ViewElement {
  public static readonly tag = "m-input-group-label"
  public static readonly observedAttributes = ["size", "borderless"]
  public connectedCallback(): void { this.upgradeProperties(); this.render() }
  public attributeChangedCallback(): void { if (this.isConnected) this.render() }
  public get size(): InputSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: InputSize) { this.setChoiceAttribute("size", value, sizes) }
  public get borderless(): boolean { return this.hasAttribute("borderless") }
  public set borderless(value: boolean) { this.setBooleanAttribute("borderless", value) }
  private render(): void {
    const size = this.size
    this.classList.add("m-input-group-label")
    this.dataset.size = size
    this.toggleAttribute("data-borderless", this.borderless)
  }
}
