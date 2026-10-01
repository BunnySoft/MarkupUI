import { ViewElement } from "../../core/index.js"
import { nativeTimeValue } from "./native.js"
import { createTimePicker } from "./time-picker.js"
import type { TimePickerController, TimePickerState } from "./time-picker.js"

export type TimePickerSize = "small" | "medium" | "large"
export const timePickerSizes: readonly TimePickerSize[] = ["small", "medium", "large"] as const

/**
 * One native time field owns live/default values, validity, forms and user operations.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"NativeChange","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Clear","web":"m:time-picker-clear","bubbles":false,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Error","web":"m:error","bubbles":true,"cancelable":false,"composed":false,"detail":{"error":"unknown"}}
 * @region {"name":"content","accepts":["one labelled native time input","phrasing","optional native clear button","optional plain readout"],"min":0,"max":null}
 */
export class TimePicker extends ViewElement {
  public static readonly tag = "m-time-picker"
  public static readonly observedAttributes = [
    "value", "placeholder", "format", "clearable", "disabled", "step", "size", "aria-label",
  ]

  private initialized = false
  private controller: TimePickerController | undefined
  private control: HTMLInputElement | undefined
  private pendingValue: string | undefined
  private defaultAttribute: string | null | undefined
  private reflectingDefault = false
  private reportedError: unknown = null
  private readonly writes = new Map<string, { before: string | null; last: string | null }>()

  public connectedCallback(): void {
    this.addEventListener("m:time-picker-error", this.onError)
    try {
      if (!this.initialized) {
        this.upgradeProperties()
        this.initialized = true
      }
      this.prepare()
      this.syncSettings()
      if (this.controller) this.controller.connect()
      else this.controller = createTimePicker(this, { clearable: this.clearable })
      if (this.pendingValue !== undefined) {
        this.controller.setValue(this.pendingValue)
        this.pendingValue = undefined
      }
      this.reportedError = null
    } catch (error) {
      this.withdraw()
      if (this.reportedError !== error) this.emit("m:error", { error })
      this.reportedError = error
    }
  }

  public disconnectedCallback(): void {
    this.withdraw()
    this.removeEventListener("m:time-picker-error", this.onError)
  }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || !this.initialized || this.reflectingDefault || !this.isConnected) return
    try {
      if (name === "value") {
        this.applyDefault(nativeTimeValue(this.ownerDocument, after ?? ""))
        this.defaultAttribute = after
      }
      else {
        this.syncSettings()
        this.controller?.refresh()
      }
    } catch (error) {
      this.withdraw()
      if (this.reportedError !== error) this.emit("m:error", { error })
      this.reportedError = error
    }
  }

  /** Live native serialization, with "" for empty (never null). Silent writes do not change reset defaults.
   * Accepts HH:mm, optional :ss and 1–3 fractional digits when the native parser preserves their precision.
   * Invalid nonempty values, null, Date objects and numbers fail before changing the field.
   */
  public get value(): string {
    return this.control?.value ?? this.pendingValue ?? this.configuredDefault()
  }
  public set value(value: string) {
    const checked = nativeTimeValue(this.ownerDocument, value)
    if (this.controller) this.controller.setValue(checked)
    else if (this.control) throw new Error("Time Picker native enhancement is unavailable; fix its anatomy and reconnect.")
    else this.pendingValue = checked
  }

  /** Native reset default. The host value attribute configures this default, not the live value.
   * Native dirty-value semantics decide whether a default update also changes the current value.
   * Empty/absent markup defaults to ""; reset is silent and may be cancelled on the native form.
   */
  public get defaultValue(): string {
    return this.control?.defaultValue ?? this.configuredDefault()
  }
  public set defaultValue(value: string) {
    const checked = nativeTimeValue(this.ownerDocument, value)
    this.applyDefault(checked)
    this.reflectingDefault = true
    try { this.setAttribute("value", checked) }
    finally { this.reflectingDefault = false }
    this.defaultAttribute = checked
  }

  /** Stable Web editing/form owner, null until initial rendering. Native name/form/min/max/
   * required/readOnly/custom validity and authored labels remain on this field.
   */
  public get native(): HTMLInputElement | null { return this.control ?? null }
  /** Immutable live native validity snapshot; requires an active connection. */
  public get state(): TimePickerState { return this.active.state }

  /** Optional native placeholder hint; browsers may not display it on time inputs. */
  public get placeholder(): string | null { return this.getAttribute("placeholder") }
  public set placeholder(value: string | null) { this.setStringAttribute("placeholder", value) }
  /** Retained format hint, default null. The Web renderer has never implemented token formatting:
   * native locale UI and serialization remain authoritative; this hint does not truncate or parse values.
   */
  public get format(): string | null { return this.getAttribute("format") }
  public set format(value: string | null) { this.setStringAttribute("format", value) }
  /** Show the optional clear action when an editable field has an entry. Does not gate explicit clear(). */
  public get clearable(): boolean { return this.hasAttribute("clearable") }
  public set clearable(value: boolean) { this.setBooleanAttribute("clearable", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  /** Native step in seconds (including fractions or "any"); null retains an authored step,
   * otherwise the native default is 60 seconds. Step controls validity, not value truncation.
   */
  public get step(): string | null { return this.getAttribute("step") }
  public set step(value: string | null) { this.setStringAttribute("step", value) }
  public get size(): TimePickerSize { return this.choiceAttribute("size", timePickerSizes, "medium") }
  public set size(value: TimePickerSize) { this.setChoiceAttribute("size", value, timePickerSizes) }

  public override focus(options?: FocusOptions): void { this.control?.focus(options) }
  public override blur(): void { this.control?.blur() }
  /** Explicit user clear: false for empty/uneditable fields; otherwise one native input/change pair.
   * Programmatic value="" is the silent alternative. Defaults are not changed.
   */
  public clear(): boolean { return this.active.clear() }
  /** Revalidate the original anatomy and synchronize native enhancement without emitting change. */
  public refresh(): void {
    if (!this.isConnected) throw new Error("Connect Time Picker before refreshing.")
    this.prepare()
    this.syncSettings()
    this.active.refresh()
  }

  private get active(): TimePickerController {
    if (!this.controller?.connected) throw new Error("Time Picker is not connected.")
    return this.controller
  }
  private applyDefault(value: string): void {
    if (this.controller) this.controller.setDefaultValue(value)
    else if (this.control) this.control.defaultValue = value
  }
  private configuredDefault(): string {
    return nativeTimeValue(this.ownerDocument, this.getAttribute("value") ?? "")
  }
  private readonly onError = (event: Event): void => {
    if (event.target !== this) return
    const detail = (event as CustomEvent<{ error: unknown }>).detail
    this.reportedError = detail.error
    this.withdraw()
    this.emit("m:error", detail)
  }
  private withdraw(): void {
    this.controller?.disconnect()
    if (this.control) for (const [name, item] of this.writes) {
      if (this.control.getAttribute(name) === item.last) {
        if (item.before === null) this.control.removeAttribute(name)
        else this.control.setAttribute(name, item.before)
      }
    }
    this.writes.clear()
  }
  private own(node: Element): boolean { return node.closest("m-time-picker, [data-time-picker]") === this }
  private prepare(): void {
    this.classList.add("m-time-picker")
    this.setAttribute("data-time-picker", "")
    const fields = [...this.querySelectorAll<HTMLInputElement>("input")].filter(node => this.own(node))
    if (fields.length > 1) throw new TypeError("Time Picker accepts one native time input, not a range.")
    if (this.control && fields[0] !== this.control) throw new Error("Keep the original Time Picker native field.")
    const configuredDefault = this.getAttribute("value")
    if (!this.control) {
      const input = fields[0] ?? this.ownerDocument.createElement("input")
      if (!fields[0]) {
        input.type = "time"
        input.setAttribute("aria-label", "Time")
      }
      if (input.type !== "time") throw new TypeError("Time Picker needs a native time input.")
      nativeTimeValue(this.ownerDocument, input.value)
      nativeTimeValue(this.ownerDocument, input.defaultValue)
      if (configuredDefault !== null) input.defaultValue = nativeTimeValue(this.ownerDocument, configuredDefault)
      input.setAttribute("data-time-control", "")
      this.control = input
      if (!fields[0]) this.append(input)
    } else if (configuredDefault !== this.defaultAttribute) {
      this.applyDefault(nativeTimeValue(this.ownerDocument, configuredDefault ?? ""))
    }
    this.defaultAttribute = configuredDefault
    const actions = [...this.querySelectorAll<HTMLElement>("[data-time-clear]")].filter(node => this.own(node))
    if (!actions.length) {
      const button = this.ownerDocument.createElement("button")
      button.type = "button"
      button.setAttribute("data-time-clear", "")
      button.hidden = true
      button.textContent = "Clear"
      this.append(button)
    }
  }
  private map(name: string, value: string | null): void {
    const control = this.control!
    const current = control.getAttribute(name), item = this.writes.get(name)
    if (value === null) {
      if (item && current === item.last) {
        if (item.before === null) control.removeAttribute(name)
        else control.setAttribute(name, item.before)
      }
      this.writes.delete(name)
      return
    }
    const before = item && current === item.last ? item.before : current
    if (current !== value) control.setAttribute(name, value)
    this.writes.set(name, { before, last: value })
  }
  private syncSettings(): void {
    if (!this.control) return
    const size = this.size
    this.map("placeholder", this.placeholder)
    this.map("step", this.step)
    this.map("disabled", this.disabled ? "" : null)
    this.map("aria-label", this.getAttribute("aria-label"))
    this.setAttribute("data-size", size)
    this.controller?.setClearable(this.clearable)
  }
}
