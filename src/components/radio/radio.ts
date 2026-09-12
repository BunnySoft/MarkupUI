import { ViewElement } from "../../core/index.js"

export type RadioSize = "small" | "medium" | "large"
export const sizes = ["small", "medium", "large"] as const
function text(value: string): void { if (typeof value !== "string") throw new TypeError("Expected a string.") }
function boolean(value: boolean): void { if (typeof value !== "boolean") throw new TypeError("Expected a boolean.") }

/**
 * Native radios own activation, exclusivity, focus, validity and submission.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"Change","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Invalid","web":"invalid","bubbles":false,"cancelable":true,"composed":false}
 */
abstract class NativeRadio extends ViewElement {
  public static readonly observedAttributes = ["checked", "value", "name", "disabled", "required", "form", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", "size"]
  private control?: HTMLInputElement
  private initialized = false
  private observer?: MutationObserver
  private label?: HTMLLabelElement

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    queueMicrotask(() => { if (this.isConnected) this.refresh() })
  }
  public disconnectedCallback(): void { this.observer?.disconnect() }
  public attributeChangedCallback(name: string): void {
    if (!this.control) return
    if (name === "size") { void this.size; return }
    const value = this.getAttribute(name)
    if (value === null) this.control.removeAttribute(name)
    else this.control.setAttribute(name, value)
  }
  /** Original or generated radio; absent checked=false, value="on", name="". */
  public get native(): HTMLInputElement {
    const nodes = [...this.querySelectorAll<HTMLInputElement>("input")].filter(node => node.closest("m-radio,m-radio-button") === this)
    if (nodes.length > 1 || nodes[0] && nodes[0].type !== "radio") throw new TypeError("Expected one native radio.")
    if (this.control && this.contains(this.control)) return this.control
    const control = nodes[0] ?? this.ownerDocument.createElement("input")
    control.type = "radio"; this.control = control
    for (const name of NativeRadio.observedAttributes) if (name !== "size" && this.hasAttribute(name)) this.attributeChangedCallback(name)
    control.setAttribute("data-radio", "")
    if (!nodes.length) this.prepend(control)
    return control
  }
  /** Live native checkedness, including peer unchecking. Silent writes retain reset defaults. */
  public get checked(): boolean { return this.native.checked }
  public set checked(value: boolean) { boolean(value); this.native.checked = value }
  /** Native reset default; the checked attribute does not control dirty live checkedness. */
  public get defaultChecked(): boolean { return this.native.defaultChecked }
  public set defaultChecked(value: boolean) { boolean(value); this.native.defaultChecked = value }
  /** Native string submission value, not the legacy boolean m-bind selection. */
  public get value(): string { return this.native.value }
  public set value(value: string) {
    text(value)
    const control = this.native, group = this.closest("m-radio-group")
    if (group && (!value || [...group.querySelectorAll<HTMLInputElement>("[data-radio]")].some(other =>
      other !== control && other.closest("m-radio-group") === group && other.value === value))) throw new TypeError("Group values must be unique nonempty strings.")
    control.value = value
  }
  public get name(): string { return this.native.name }
  public set name(value: string) { text(value); this.native.name = value }
  /** Own disabled flag only; native fieldset and first-legend rules determine effective state. */
  public get disabled(): boolean { return this.native.disabled }
  public set disabled(value: boolean) { boolean(value); this.native.disabled = value }
  public get required(): boolean { return this.native.required }
  public set required(value: boolean) { boolean(value); this.native.required = value }
  /** Read-only native association. The form attribute selects an external form. */
  public get form(): HTMLFormElement | null { return this.native.form }
  public get validity(): ValidityState { return this.native.validity }
  public get validationMessage(): string { return this.native.validationMessage }
  public get willValidate(): boolean { return this.native.willValidate }
  public get size(): RadioSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: RadioSize) { this.setChoiceAttribute("size", value, sizes) }
  public override focus(options?: FocusOptions): void { this.native.focus(options) }
  public override blur(): void { this.native.blur() }
  public override click(): void { this.native.click() }
  public checkValidity(): boolean { return this.native.checkValidity() }
  public reportValidity(): boolean { return this.native.reportValidity() }
  public setCustomValidity(message: string): void { text(message); this.native.setCustomValidity(message) }
  /** Adopt surviving native content; never replace controls or install a key/click engine. */
  public refresh(): void {
    void this.size
    if (this.hasAttribute("role") || this.hasAttribute("tabindex")) throw new TypeError("Native controls own semantics and focus.")
    this.observer?.disconnect()
    const control = this.native
    if (control.hasAttribute("role")) throw new TypeError("Keep native radio semantics.")
    let label = control.labels?.[0] ?? control.closest("label")
    if (!label) {
      label = this.querySelector("label") ?? this.ownerDocument.createElement("label")
      if (!this.contains(label)) {
        label.append(...this.childNodes); this.append(label); this.label = label
      } else label.prepend(control)
    }
    if (label === this.label) for (const node of [...this.childNodes]) if (node !== label) label.append(node)
    ;(control.parentElement === label ? label : this).classList.add(this.localName)
    this.observer ??= new MutationObserver(() => this.refresh())
    if (this.isConnected) this.observer.observe(this, { childList: true, subtree: true })
  }
}

/** @region {"name":"content","accepts":["phrasing","one native radio","native label"],"min":0,"max":null} */
export class Radio extends NativeRadio { public static readonly tag = "m-radio" }

/** Visual radio treatment, not a button control or button role.
 * @region {"name":"content","accepts":["phrasing","one native radio","native label"],"min":0,"max":null}
 */
export class RadioButton extends NativeRadio { public static readonly tag = "m-radio-button" }
