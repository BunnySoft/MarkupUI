import { ViewElement } from "../../core/index.js"
import { createRadioGroup, radioMembers, setRadioValue } from "../native-radio.js"
import type { RadioGroupController } from "../native-radio.js"
import type { RadioGroupChange } from "../native-radio.js"
import { sizes } from "./radio.js"
import type { Radio, RadioSize } from "./radio.js"

export type RadioStatus = "error" | "warning"
export type { RadioGroupChange } from "../native-radio.js"
const statuses = ["error", "warning"] as const

/**
 * One complete native name/form group. Never renames members or synthesizes keyboard input.
 * @region {"name":"content","accepts":["native fieldset with first nonempty legend","Radio","RadioButton","nested RadioGroup"],"min":0,"max":null}
 */
export class RadioGroup extends ViewElement {
  public static readonly tag = "m-radio-group"
  public static readonly observedAttributes = ["value", "disabled", "size", "status", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"]
  private field?: HTMLFieldSetElement
  private generated = false
  private initialized = false
  private initialValue = true
  private controller: RadioGroupController | undefined
  private observer?: MutationObserver
  private failure: string | null = null

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    queueMicrotask(() => { if (this.isConnected) this.attemptRefresh() })
  }
  public disconnectedCallback(): void { this.observer?.disconnect(); this.release() }
  private release(): void {
    this.controller?.disconnect(); this.controller = undefined
    for (const type of ["m:radio-group-change", "m:radio-group-error"]) this.field?.removeEventListener(type, this.forward)
  }
  public attributeChangedCallback(name: string): void {
    if (this.field && (name === "disabled" || name.startsWith("aria-"))) {
      const value = this.getAttribute(name)
      if (value === null) this.field.removeAttribute(name)
      else this.field.setAttribute(name, value)
    }
    if (name === "value") this.initialValue = true
    if (this.initialized && this.isConnected) this.attemptRefresh()
  }
  /** Original or generated fieldset. Its first direct legend must be nonempty. */
  public get native(): HTMLFieldSetElement {
    const fields = [...this.children].filter(node => node.localName === "fieldset") as HTMLFieldSetElement[]
    if (fields.length > 1) throw new TypeError("Expected one native fieldset.")
    if (this.field && this.contains(this.field)) {
      if (this.generated) {
        const nodes = [...this.childNodes], index = nodes.indexOf(this.field)
        this.field.prepend(...nodes.slice(0, index)); this.field.append(...nodes.slice(index + 1))
      }
      return this.field
    }
    this.release()
    const field = fields[0] ?? this.ownerDocument.createElement("fieldset")
    this.generated = !fields.length
    if (this.generated) { field.append(...this.childNodes); this.append(field) }
    this.field = field; field.classList.add("m-radio-group"); field.setAttribute("data-radio-group", "")
    for (const name of RadioGroup.observedAttributes) if ((name === "disabled" || name.startsWith("aria-")) && this.hasAttribute(name)) field.setAttribute(name, this.getAttribute(name)!)
    return field
  }
  /** Computed current native selection; null when empty. The value attribute requests selection once when applied, not on reconnect. */
  public get value(): string | null { return radioMembers(this.prepare()).find(node => node.checked)?.value ?? null }
  public set value(value: string | null) { setRadioValue(this.prepare(), value); this.initialValue = false }
  /** Common native name, null for an empty group. Set names on members, never on a visual group. */
  public get name(): string | null { return radioMembers(this.prepare())[0]?.name ?? null }
  public get form(): HTMLFormElement | null { return radioMembers(this.prepare())[0]?.form ?? null }
  public get disabled(): boolean { return this.native.disabled }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value); this.native.disabled = value }
  public get size(): RadioSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: RadioSize) { this.setChoiceAttribute("size", value, sizes) }
  public get status(): RadioStatus | null { return this.choiceAttribute("status", statuses, null) }
  public set status(value: RadioStatus | null) { this.setNullableChoiceAttribute("status", value, statuses) }
  public get error(): string | null { return this.failure ?? this.controller?.error ?? null }
  private prepare(): HTMLFieldSetElement {
    void this.size; void this.status
    if (this.hasAttribute("role") || this.hasAttribute("tabindex")) throw new TypeError("Native fieldsets own group semantics.")
    const field = this.native
    for (const radio of field.querySelectorAll<Radio>("m-radio,m-radio-button")) radio.refresh()
    return field
  }
  /** Validate anatomy/scope, reconcile late members, and clear explicit errors without changing selection. */
  public refresh(): void {
    this.observer?.disconnect()
    try {
      const field = this.prepare()
      if (this.initialValue && this.hasAttribute("value")) setRadioValue(field, this.getAttribute("value"))
      radioMembers(field); this.initialValue = false
      if (this.isConnected) {
        if (!this.controller?.connected) {
          this.controller = createRadioGroup(field)
          for (const type of ["m:radio-group-change", "m:radio-group-error"]) field.addEventListener(type, this.forward)
        } else this.controller.refresh()
      }
      this.failure = null
    } catch (reason) { this.failure = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally {
      this.observer ??= new MutationObserver(() => this.attemptRefresh())
      if (this.isConnected) this.observer.observe(this, { childList: true, subtree: true })
    }
  }
  private forward = (event: Event): void => {
    if (event.target !== this.field || !this.isConnected) return
    if (event.type === "m:radio-group-change") this.emit<RadioGroupChange>("m:radio-group-change", (event as CustomEvent).detail, { bubbles: false })
    else this.emit<{ message: string }>("m:radio-group-error", (event as CustomEvent).detail, { bubbles: false })
  }
  private attemptRefresh(): void {
    const previous = this.error
    try { this.refresh() } catch {
      if (this.error !== previous) this.emit<{ message: string }>("m:radio-group-error", { message: this.error! }, { bubbles: false })
    }
  }
}
