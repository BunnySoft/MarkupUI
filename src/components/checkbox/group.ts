import { ViewElement } from "../../core/index.js"
import { Checkbox, sizes } from "./checkbox.js"
import type { CheckboxSize } from "./checkbox.js"

export interface CheckboxGroupOptions { min?: number; max?: number | null }
export interface CheckboxGroupChange { values: string[]; value: string; actionType: "check" | "uncheck" }
export type CheckboxStatus = "error" | "warning"
const statuses = ["error", "warning"] as const
const owner = Symbol.for("markup-ui.checkbox-group.owner")
type Owned = HTMLInputElement & { [owner]?: unknown }
interface Member { before: string | null; last: string | null }

/**
 * Native fieldset/legend group. Limits constrain activation, not writes or native validity.
 * @region {"name":"content","accepts":["native fieldset with first nonempty legend","Checkbox","nested CheckboxGroup"],"min":0,"max":null}
 */
export class CheckboxGroup extends ViewElement {
  public static readonly tag = "m-checkbox-group"
  public static readonly observedAttributes = ["min", "max", "disabled", "size", "status"]
  private field?: HTMLFieldSetElement
  private generated = false
  private initialized = false
  private observer?: MutationObserver
  private members = new Map<Owned, Member>()
  private tasks = new Set<ReturnType<typeof setTimeout>>()
  private failure: string | null = null

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.addEventListener("click", this.onClick, true)
    this.addEventListener("change", this.onChange)
    this.ownerDocument.addEventListener("reset", this.onReset, true)
    queueMicrotask(() => { if (this.isConnected) this.attemptRefresh() })
  }
  public disconnectedCallback(): void {
    this.pause()
    this.removeEventListener("click", this.onClick, true)
    this.removeEventListener("change", this.onChange)
    this.ownerDocument.removeEventListener("reset", this.onReset, true)
    this.tasks.forEach(clearTimeout); this.tasks.clear()
    for (const [control, member] of this.members) this.release(control, member)
    this.members.clear()
  }
  public attributeChangedCallback(name: string): void {
    if (name === "disabled" && this.field) this.field.disabled = this.hasAttribute("disabled")
    if (this.initialized && this.isConnected) this.attemptRefresh()
  }
  /** Original or generated native fieldset. Its first direct legend must have a nonempty name. */
  public get native(): HTMLFieldSetElement {
    if (this.field && this.contains(this.field)) {
      if (this.generated) {
        const nodes = [...this.childNodes], index = nodes.indexOf(this.field)
        this.field.prepend(...nodes.slice(0, index)); this.field.append(...nodes.slice(index + 1))
      }
      return this.field
    }
    const fields = [...this.children].filter(node => node.localName === "fieldset") as HTMLFieldSetElement[]
    if (fields.length > 1) throw new TypeError("Expected one native fieldset.")
    const field = fields[0] ?? this.ownerDocument.createElement("fieldset")
    if (!fields.length) { field.append(...this.childNodes); this.append(field); this.generated = true }
    this.field = field
    if (this.hasAttribute("disabled")) field.disabled = true
    field.classList.add("m-checkbox-group")
    return field
  }
  /** Computed live native selection in DOM order, including disabled checked members. No configured [] default. */
  public get value(): string[] { return this.collect().filter(control => control.checked).map(control => control.value) }
  public set value(value: readonly string[]) {
    if (!Array.isArray(value) || value.some(key => typeof key !== "string") || new Set(value).size !== value.length) throw new TypeError("Expected unique string keys.")
    this.validateLimits(this.min, this.max)
    const nodes = this.collect()
    if (value.some(key => !nodes.some(control => control.value === key))) {
      throw new TypeError("Expected unique existing string keys; unknown keys are not ignored.")
    }
    for (const control of nodes) if (control.checked !== value.includes(control.value)) control.checked = value.includes(control.value)
    this.refresh()
  }
  /** @min 0
   * @integer
   */
  public get min(): number { return this.numberAttribute("min", 0) }
  public set min(value: number) { this.setLimits({ min: value }) }
  /** @min 0
   * @integer
   */
  public get max(): number | null { return this.numberAttribute("max", null) }
  public set max(value: number | null) { this.setLimits({ max: value }) }
  public get withinLimits(): boolean { const count = this.value.length; return count >= this.min && (this.max === null || count <= this.max) }
  public get error(): string | null { return this.failure }
  public get disabled(): boolean { return this.native.disabled }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value); this.native.disabled = value }
  public get size(): CheckboxSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: CheckboxSize) { this.setChoiceAttribute("size", value, sizes) }
  public get status(): CheckboxStatus | null { return this.choiceAttribute("status", statuses, null) }
  public set status(value: CheckboxStatus | null) { this.setNullableChoiceAttribute("status", value, statuses) }
  /** Atomic limits update; out-of-bounds native selections are retained and may be repaired by activation. */
  public setLimits(options: CheckboxGroupOptions): void {
    if (!options || typeof options !== "object" || Array.isArray(options) || Object.keys(options).some(key => key !== "min" && key !== "max")) throw new TypeError("Unsupported limits.")
    const min = "min" in options ? options.min : this.min, max = "max" in options ? options.max : this.max
    this.validateLimits(min, max)
    if (this.isConnected) this.collect()
    const initialized = this.initialized
    this.initialized = false
    this.setAttribute("min", String(min))
    if (max === null) this.removeAttribute("max")
    else this.setAttribute("max", String(max))
    this.initialized = initialized
    if (this.isConnected) this.refresh()
  }
  private validateLimits(min: unknown, max: unknown): void {
    if (!Number.isSafeInteger(min) || (min as number) < 0 || max !== null && (!Number.isSafeInteger(max) || (max as number) < (min as number))) throw new RangeError("Limits need nonnegative integers, max >= min or null.")
  }
  private collect(): Owned[] {
    const field = this.native
    if (this.hasAttribute("role") || this.hasAttribute("tabindex") || field.hasAttribute("role") || field.hasAttribute("tabindex")
      || ![...field.children].find(node => node.localName === "legend")?.textContent?.trim()) throw new TypeError("Keep a native fieldset with a nonempty first legend and no role/tabindex.")
    const boxes = [...field.querySelectorAll<Checkbox>("m-checkbox")].filter(box => box.closest("m-checkbox-group") === this)
    boxes.forEach(box => box.refresh())
    const nodes = [...field.querySelectorAll<Owned>("[data-checkbox]")].filter(control => control.closest("m-checkbox-group") === this && !control.closest("m-switch"))
    const keys = new Set<string>()
    for (const control of nodes) {
      if (!(control instanceof HTMLInputElement) || control.type !== "checkbox" || control.hasAttribute("role")
        || ![...control.labels ?? []].some(label => label.textContent?.trim())) throw new TypeError("Each member needs a native checkbox and label.")
      if (!control.hasAttribute("value") || !control.value || keys.has(control.value)) throw new TypeError("Values must be explicit, nonempty, unique strings.")
      const previous = control[owner]
      if (previous instanceof CheckboxGroup && previous !== this) {
        const member = previous.members.get(control)
        if (member) { previous.release(control, member); previous.members.delete(control) }
      }
      if (control[owner] && control[owner] !== this) throw new Error("Checkbox already has an owner.")
      keys.add(control.value)
    }
    return nodes
  }
  private pause(): void {
    for (const record of this.observer?.takeRecords() ?? []) this.mark(record)
    this.observer?.disconnect()
  }
  private mark(record: MutationRecord): void {
    const member = this.members.get(record.target as Owned)
    if (member && record.attributeName === "aria-disabled") member.before = member.last = (record.target as Element).getAttribute("aria-disabled")
  }
  private release(control: Owned, member: Member): void {
    if (control.getAttribute("aria-disabled") === member.last) this.aria(control, member.before)
    if (control[owner] === this) delete control[owner]
  }
  private aria(control: Owned, value: string | null): void {
    if (value === null) control.removeAttribute("aria-disabled")
    else control.setAttribute("aria-disabled", value)
  }
  /** Refresh derived limit ARIA after direct native property writes. Never clamps or changes reset defaults. */
  public refresh(): void {
    if (!this.isConnected) return
    this.pause()
    try {
      this.validateLimits(this.min, this.max)
      void this.size; void this.status
      const nodes = this.collect()
      for (const [control, member] of this.members) if (!nodes.includes(control)) { this.release(control, member); this.members.delete(control) }
      const count = nodes.filter(control => control.checked).length
      for (const control of nodes) {
        let member = this.members.get(control)
        if (!member) {
          const before = control.getAttribute("aria-disabled")
          member = { before, last: before }; this.members.set(control, member)
          control[owner] = this
        }
        const blocked = control.checked ? count <= this.min : this.max !== null && count >= this.max
        member.last = blocked ? "true" : member.before
        this.aria(control, member.last)
      }
      this.failure = null
    } catch (reason) {
      this.failure = reason instanceof Error ? reason.message : String(reason)
      throw reason
    } finally {
      this.observer ??= new MutationObserver(records => { records.forEach(record => this.mark(record)); this.attemptRefresh() })
      this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["checked", "disabled", "value", "type", "form", "aria-disabled", "data-checkbox"] })
    }
  }
  private report(reason: unknown): void {
    const message = reason instanceof Error ? reason.message : String(reason)
    if (message !== this.failure) {
      this.failure = message
      this.emit<{ message: string }>("m:checkbox-group-error", { message }, { bubbles: false })
    }
  }
  private attemptRefresh(): void {
    const previous = this.failure
    try { this.refresh() } catch (reason) { this.failure = previous; this.report(reason) }
  }
  private later(callback: () => void): void {
    const task = setTimeout(() => { this.tasks.delete(task); if (this.isConnected) callback() }, 0)
    this.tasks.add(task)
  }
  private target(event: Event): Owned | null {
    const control = event.target
    return control instanceof HTMLInputElement && control.hasAttribute("data-checkbox") && control.closest("m-checkbox-group") === this && !control.closest("m-switch") ? control : null
  }
  private onClick = (event: Event): void => {
    const control = this.target(event)
    if (!control) return
    const previous = this.failure
    try {
      this.refresh()
      const count = this.value.length
      // Native pre-activation already applied the proposal. Cancellation restores mixed state too.
      if (control.matches(":disabled") || this.members.get(control)?.before === "true"
        || (control.checked ? this.max !== null && count > this.max : count < this.min)) event.preventDefault()
    } catch (reason) { event.preventDefault(); this.failure = previous; this.report(reason) }
    this.later(() => this.attemptRefresh())
  }
  private onChange = (event: Event): void => {
    const control = this.target(event)
    if (!control) return
    const previous = this.failure
    try {
      this.refresh()
      const detail: CheckboxGroupChange = { values: this.value, value: control.value, actionType: control.checked ? "check" : "uncheck" }
      this.later(() => this.emit<CheckboxGroupChange>("m:checkbox-group-change", detail, { bubbles: false }))
    } catch (reason) { this.failure = previous; this.report(reason) }
  }
  private onReset = (event: Event): void => {
    if ([...this.members.keys()].some(control => control.form === event.target)) this.later(() => this.attemptRefresh())
  }
}
