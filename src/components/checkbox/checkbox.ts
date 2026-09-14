import { ViewElement } from "../../core/index.js"

export type CheckboxSize = "small" | "medium" | "large"
export const sizes = ["small", "medium", "large"] as const
export function text(value: string): void { if (typeof value !== "string") throw new TypeError("Expected a string.") }
function boolean(value: boolean): void { if (typeof value !== "boolean") throw new TypeError("Expected a boolean.") }

/**
 * One native checkbox owns activation, checkedness, mixed state, focus and forms.
 * Native input then change bubble unchanged; programmatic writes emit neither.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"Change","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Invalid","web":"invalid","bubbles":false,"cancelable":true,"composed":false}
 * @region {"name":"content","accepts":["phrasing","one native checkbox","native label"],"min":0,"max":null}
 */
export class Checkbox extends ViewElement {
  public static readonly tag = "m-checkbox"
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
    if (name === "size") { if (this.isConnected) this.refresh(); return }
    const value = this.getAttribute(name)
    if (value === null) this.control.removeAttribute(name)
    else this.control.setAttribute(name, value)
  }
  /** Original or generated native input. Absence uses native checked=false, value="on". */
  public get native(): HTMLInputElement {
    const nodes = [...this.querySelectorAll<HTMLInputElement>("input")].filter(node => node.closest("m-checkbox") === this)
    if (nodes.length > 1 || nodes[0] && nodes[0].type !== "checkbox") throw new TypeError("Expected one native checkbox.")
    if (this.control && this.contains(this.control)) return this.control
    const control = nodes[0] ?? this.ownerDocument.createElement("input")
    control.type = "checkbox"
    this.control = control
    for (const name of Checkbox.observedAttributes) if (name !== "size" && this.hasAttribute(name)) this.attributeChangedCallback(name)
    control.setAttribute("data-checkbox", "")
    if (!nodes.length) this.prepend(control)
    return control
  }
  /** Live checkedness; silent writes do not alter defaultChecked or indeterminate. */
  public get checked(): boolean { return this.native.checked }
  public set checked(value: boolean) { boolean(value); this.groupRefresh(); this.native.checked = value; this.groupRefresh() }
  /** Native reset default. The checked attribute initializes this, not a controlled live value. */
  public get defaultChecked(): boolean { return this.native.defaultChecked }
  public set defaultChecked(value: boolean) { boolean(value); this.groupRefresh(); this.native.defaultChecked = value; this.groupRefresh() }
  /** Native presentation only, initially false; not a third submission value. Activation clears it. */
  public get indeterminate(): boolean { return this.native.indeterminate }
  public set indeterminate(value: boolean) { boolean(value); this.native.indeterminate = value }
  /** Native string submission value, "on" when absent. This is NOT the legacy boolean binding. */
  public get value(): string { return this.native.value }
  public set value(value: string) {
    text(value)
    const control = this.native, group = this.closest("m-checkbox-group")
    if (group && (!value || [...group.querySelectorAll<HTMLInputElement>("[data-checkbox]")].some(other =>
      other !== control && other.closest("m-checkbox-group") === group && other.value === value))) throw new TypeError("Group values must be unique nonempty strings.")
    control.value = value
  }
  public get name(): string { return this.native.name }
  public set name(value: string) { text(value); this.native.name = value }
  /** Own flag only; effective disabledness includes native fieldset / first-legend rules. */
  public get disabled(): boolean { return this.native.disabled }
  public set disabled(value: boolean) { boolean(value); this.native.disabled = value }
  public get required(): boolean { return this.native.required }
  public set required(value: boolean) { boolean(value); this.native.required = value }
  /** Read-only native association; use the form attribute to select an external form. */
  public get form(): HTMLFormElement | null { return this.native.form }
  public get validity(): ValidityState { return this.native.validity }
  public get validationMessage(): string { return this.native.validationMessage }
  public get willValidate(): boolean { return this.native.willValidate }
  public get size(): CheckboxSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: CheckboxSize) { this.setChoiceAttribute("size", value, sizes) }
  public override focus(options?: FocusOptions): void { this.native.focus(options) }
  public override blur(): void { this.native.blur() }
  /** Native activation, including disabled checks, cancelable click and input/change ordering. */
  public override click(): void { this.native.click() }
  public checkValidity(): boolean { return this.native.checkValidity() }
  public reportValidity(): boolean { return this.native.reportValidity() }
  public setCustomValidity(message: string): void { text(message); this.native.setCustomValidity(message) }
  /** Adopt late native content without cloning nodes or overwriting live native properties. */
  public refresh(): void {
    void this.size
    if (this.hasAttribute("role") || this.hasAttribute("tabindex")) throw new TypeError("Native controls own semantics and focus.")
    this.observer?.disconnect()
    const control = this.native
    let label = control.labels?.[0]
    if (!label) {
      label = this.querySelector("label") ?? this.ownerDocument.createElement("label")
      if (!this.contains(label)) {
        label.append(...this.childNodes)
        this.append(label)
        this.label = label
      } else label.prepend(control)
    }
    if (label === this.label) for (const node of [...this.childNodes]) if (node !== label) label.append(node)
    const skin = control.parentElement === label ? label : this
    skin.classList.add("m-checkbox")
    this.observer ??= new MutationObserver(() => this.refresh())
    if (this.isConnected) this.observer.observe(this, { childList: true, subtree: true })
  }
  private groupRefresh(): void {
    const group = this.closest("m-checkbox-group") as (HTMLElement & { refresh(): void }) | null
    if (group?.isConnected && typeof group.refresh === "function") group.refresh()
  }
}
