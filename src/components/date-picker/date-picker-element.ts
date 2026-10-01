import { ViewElement } from "../../core/index.js"
import { datePickerDefault, datePickerEntry, datePickerInputType, datePickerMode, datePickerProjection, datePickerTypes, datePickerValues, validateDatePickerConstraints } from "./native.js"
import type { DatePickerProfile, DatePickerType, DatePickerValue } from "./native.js"
import { createDatePicker } from "./date-picker.js"
import type { DatePickerController, DatePickerState } from "./date-picker.js"

export { datePickerTypes } from "./native.js"
export type { DatePickerType } from "./native.js"

export interface DatePickerElementConfiguration {
  readonly type: DatePickerType
  readonly value: DatePickerValue
  readonly defaultValue: DatePickerValue
}

/**
 * Typed markup/native mapping. The concrete Date Picker owner handles all editing and transactions.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"NativeChange","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"DatePickerValue"}}
 * @event {"name":"Draft","web":"m:date-picker-draft","bubbles":false,"cancelable":false,"composed":false,"detail":{"value":"null | DatePickerValue","draft":"string | readonly [string, string]","badInput":"boolean","composing":"boolean"}}
 * @event {"name":"Clear","web":"m:date-picker-clear","bubbles":false,"cancelable":false,"composed":false,"detail":{"value":"DatePickerValue"}}
 * @event {"name":"Error","web":"m:error","bubbles":true,"cancelable":false,"composed":false,"detail":{"error":"unknown"}}
 * @region {"name":"content","accepts":["labelled native input(s)","phrasing","optional native clear button","optional plain readout"],"min":0,"max":null}
 */
export class DatePicker extends ViewElement {
  public static readonly tag = "m-date-picker"
  public static readonly observedAttributes = [
    "value", "type", "placeholder", "clearable", "disabled", "readonly", "required", "name", "form",
    "min", "max", "step", "format", "aria-label", "aria-labelledby", "aria-describedby",
  ]

  private initialized = false
  private reflecting = false
  private controller: DatePickerController | undefined
  private controls: readonly HTMLInputElement[] = []
  private renderedType: DatePickerType | undefined
  private pendingValue: DatePickerValue | undefined
  private defaultAttribute: string | null | undefined
  private reportedError: unknown = null
  private readonly generated = new Set<HTMLInputElement>()
  private readonly labels = new Map<HTMLInputElement, string>()
  private spare: HTMLInputElement | undefined
  private fields: HTMLElement | undefined
  private readonly writes = new Map<HTMLInputElement, Map<string, { before: string | null; last: string | null }>>()

  public connectedCallback(): void {
    this.addEventListener("m:date-picker-error", this.onError)
    try {
      if (!this.initialized) {
        this.upgradeProperties()
        this.initialized = true
      }
      this.prepare()
      this.syncSettings()
      if (this.controller) this.controller.connect()
      else this.controller = createDatePicker(this, { type: datePickerMode(this.type).profile, clearable: this.clearable,
        ...(this.getAttribute("value") !== null ? { defaultValue: this.configuredDefault() } : {}) })
      if (this.pendingValue !== undefined) {
        this.controller.setValue(this.pendingValue)
        this.pendingValue = undefined
      }
      this.reportedError = null
    } catch (error) {
      this.withdraw()
      this.report(error)
    }
  }

  public disconnectedCallback(): void {
    this.withdraw()
    this.removeEventListener("m:date-picker-error", this.onError)
  }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || !this.initialized || this.reflecting || !this.isConnected) return
    try {
      if (name === "type" && this.type !== this.renderedType) throw new Error("Use configure({ type, value, defaultValue }) to change an initialized Date Picker mode.")
      if (name === "value") {
        this.controller!.setDefaultValue(this.configuredDefault())
        this.defaultAttribute = after
      } else {
        this.validateSettings(datePickerMode(this.type).profile)
        this.syncSettings()
        this.controller?.refresh()
      }
    } catch (error) {
      this.reflect(() => {
        if (before === null) this.removeAttribute(name)
        else this.setAttribute(name, before)
      })
      if (this.controller?.connected) this.syncSettings()
      this.report(error)
    }
  }

  /** Live native value: dates/months/local datetimes and quarters are strings; year is an integer.
   * Ranges use two-string tuples, including partial ["", end]. Empty is "" (range ["", ""]).
   * Null means a real invalid/incomplete user draft, never an accepted application input.
   * Silent setters validate the whole value before writes and never change reset defaults.
   */
  public get value(): DatePickerValue | null {
    if (this.controls.length && !this.controller) throw new Error("Date Picker enhancement is unavailable; fix its anatomy and reconnect.")
    return this.controller ? this.controller.value : this.pendingValue ?? this.configuredDefault()
  }
  public set value(value: DatePickerValue) {
    const { profile, range } = datePickerMode(this.type)
    const parsed = datePickerValues(this.ownerDocument, profile, range, value)
    if (this.controller) this.controller.setValue(value)
    else if (this.controls.length) throw new Error("Date Picker enhancement is unavailable; fix its anatomy and reconnect.")
    else this.pendingValue = datePickerProjection(parsed)
  }

  /** Native reset default, distinct from the live value. Host value markup configures this default:
   * scalars use native text, year integer text, and ranges use JSON two-string arrays.
   * Native dirty flags decide whether changing defaults also updates the live fields.
   */
  public get defaultValue(): DatePickerValue {
    if (this.controls.length && !this.controller) throw new Error("Date Picker enhancement is unavailable; fix its anatomy and reconnect.")
    return this.controller?.defaultValue ?? this.configuredDefault()
  }
  public set defaultValue(value: DatePickerValue) {
    const { profile, range } = datePickerMode(this.type)
    const parsed = datePickerValues(this.ownerDocument, profile, range, value)
    const text = range ? JSON.stringify(parsed.map(item => item.text)) : parsed[0]!.text
    if (this.controls.length && !this.controller) throw new Error("Date Picker enhancement is unavailable; fix its anatomy and reconnect.")
    if (this.controller) this.controller.setDefaultValue(value)
    this.reflect(() => this.setAttribute("value", text))
    this.defaultAttribute = text
  }

  /** All seven public modes are retained. Initialized schema changes require explicit configure(). */
  public get type(): DatePickerType { return this.choiceAttribute("type", datePickerTypes, "date") }
  public set type(value: DatePickerType) {
    const { profile, range } = datePickerMode(value)
    if (this.controls.length && value !== this.renderedType) throw new Error("Use configure({ type, value, defaultValue }) to change an initialized Date Picker mode.")
    if (this.pendingValue !== undefined) datePickerValues(this.ownerDocument, profile, range, this.pendingValue)
    this.setChoiceAttribute("type", value, datePickerTypes)
  }

  /** Stable Web editing/validation/form owners. Authored ids, labels, listeners and custom validity survive. */
  public get native(): readonly HTMLInputElement[] { return this.controls }
  /** Immutable native/draft/order snapshot. Invalid quarter/year drafts have value=null and badInput=true. */
  public get state(): DatePickerState { return this.active.state }
  /** Actual common native form owner; formId maps the host's explicit external association. */
  public get form(): HTMLFormElement | null { return this.controls[0]?.form ?? null }
  public get formId(): string | null { return this.getAttribute("form") }
  public set formId(value: string | null) { this.setStringAttribute("form", value) }
  /** Both range endpoints retain their own authored names unless this mapping is supplied. */
  public get name(): string | null { return this.getAttribute("name") }
  public set name(value: string | null) { this.setStringAttribute("name", value) }
  /** Optional native placeholder hint; native calendar controls may not display it. */
  public get placeholder(): string | null { return this.getAttribute("placeholder") }
  public set placeholder(value: string | null) { this.setStringAttribute("placeholder", value) }
  public get clearable(): boolean { return this.hasAttribute("clearable") }
  public set clearable(value: boolean) { this.setBooleanAttribute("clearable", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get readOnly(): boolean { return this.hasAttribute("readonly") }
  public set readOnly(value: boolean) { this.setBooleanAttribute("readonly", value) }
  public get required(): boolean { return this.hasAttribute("required") }
  public set required(value: boolean) { this.setBooleanAttribute("required", value) }
  /** Native lower bound for date/month/local datetime/year. Quarter is bounded by its fixed grammar, not text min/max. */
  public get min(): string | null { return this.getAttribute("min") }
  public set min(value: string | null) { this.validateSetting("min", value); this.setStringAttribute("min", value) }
  /** Native upper bound; quarter's text owner has no native min/max interpretation. */
  public get max(): string | null { return this.getAttribute("max") }
  public set max(value: string | null) { this.validateSetting("max", value); this.setStringAttribute("max", value) }
  /** Native step controls validity, not serialization/truncation. Year uses positive integer steps. */
  public get step(): string | null { return this.getAttribute("step") }
  public set step(value: string | null) {
    this.validateSetting("step", value)
    this.setStringAttribute("step", value)
  }
  /** Retained hint only. Native locale UI/serialization remain authoritative; no token conversion engine. */
  public get format(): string | null { return this.getAttribute("format") }
  public set format(value: string | null) { this.setStringAttribute("format", value) }

  public override focus(options?: FocusOptions): void { this.controls[0]?.focus(options) }
  public override blur(): void { (this.controls.find(input => input === this.ownerDocument.activeElement) ?? this.controls[0])?.blur() }
  /** Explicit user clear: all-or-nothing eligibility, then one native input/change pair per changed endpoint.
   * value="" / ["", ""] is the silent alternative. Defaults are retained.
   */
  public clear(): boolean { return this.active.clear() }
  public refresh(): void {
    const controller = this.active
    this.prepare()
    this.syncSettings()
    controller.refresh()
  }
  public checkValidity(): boolean { return this.active.inputs.map(input => input.checkValidity()).every(Boolean) }
  public reportValidity(): boolean {
    for (const input of this.active.inputs) if (!input.reportValidity()) return false
    return true
  }

  /** Explicit schema transaction. Both live/default values are required, so nothing is silently converted.
   * Surviving fields retain identity. Cardinality changes are available only for renderer-generated fields;
   * authored endpoint cardinality is fixed so source nodes are never silently removed.
   */
  public configure(configuration: DatePickerElementConfiguration): void {
    const { profile, range } = datePickerMode(configuration.type)
    const parsed = datePickerValues(this.ownerDocument, profile, range, configuration.defaultValue)
    const live = datePickerValues(this.ownerDocument, profile, range, configuration.value)
    this.validateSettings(profile)
    const text = range ? JSON.stringify(parsed.map(item => item.text)) : parsed[0]!.text
    if (!this.controls.length) {
      this.reflect(() => { this.setAttribute("type", configuration.type); this.setAttribute("value", text) })
      this.pendingValue = datePickerProjection(live)
      return
    }
    const controller = this.active
    if (this.controls.length === (range ? 2 : 1)) {
      controller.configure({ type: profile, value: configuration.value, defaultValue: configuration.defaultValue })
    } else {
      if (this.controls.some(input => !this.generated.has(input))) throw new Error("Authored endpoint cardinality is fixed; configure() does not remove source nodes.")
      controller.refresh()
      this.withdraw()
      const first = this.controls[0]!
      if (range) {
        const second = this.spare ?? this.newInput(configuration.type, 1)
        this.spare = undefined
        this.fields!.append(second)
        this.controls = Object.freeze([first, second])
      } else {
        this.spare = this.controls[1]!
        this.spare.remove()
        this.controls = Object.freeze([first])
      }
      for (const input of this.controls) input.type = datePickerInputType(profile)
      this.controller = createDatePicker(this, { type: profile, clearable: this.clearable,
        value: configuration.value, defaultValue: configuration.defaultValue })
    }
    this.renderedType = configuration.type
    this.reflect(() => { this.setAttribute("type", configuration.type); this.setAttribute("value", text) })
    this.defaultAttribute = text
    this.syncSettings()
    this.active.refresh()
  }

  private get active(): DatePickerController {
    if (!this.controller?.connected) throw new Error("Date Picker is not connected.")
    return this.controller
  }
  private reflect(action: () => void): void {
    this.reflecting = true
    try { action() } finally { this.reflecting = false }
  }
  private configuredDefault(): DatePickerValue {
    const { profile, range } = datePickerMode(this.type), text = this.getAttribute("value")
    if (range) {
      const value: unknown = text === null ? ["", ""] : JSON.parse(text)
      const parsed = datePickerValues(this.ownerDocument, profile, true, value)
      return Object.freeze([parsed[0]!.text, parsed[1]!.text] as const)
    }
    return datePickerDefault(this.ownerDocument, profile, text ?? "").value
  }
  private validateSetting(name: string, value: string | null): void {
    if (value !== null && typeof value !== "string") throw new TypeError(`${name} must be a string or null.`)
    this.validateSettings(datePickerMode(this.type).profile, { name, value })
  }
  private validateSettings(profile: DatePickerProfile, change?: { name: string; value: string | null }): void {
    const inputs: readonly (HTMLInputElement | undefined)[] = this.controls.length ? this.controls : [undefined]
    for (const input of inputs) {
      const effective = (name: string): string | null => {
        const host = change?.name === name ? change.value : this.getAttribute(name)
        if (host !== null) return host
        const item = input && this.writes.get(input)?.get(name), current = input?.getAttribute(name) ?? null
        return item && current === item.last ? item.before : current
      }
      validateDatePickerConstraints(profile, { min: effective("min"), max: effective("max"), step: effective("step"),
        pattern: input?.getAttribute("pattern") ?? null })
    }
  }
  private report(error: unknown): void {
    if (this.reportedError !== error) this.emit("m:error", { error })
    this.reportedError = error
  }
  private readonly onError = (event: Event): void => {
    if (event.target !== this) return
    const detail = (event as CustomEvent<{ error: unknown }>).detail
    this.withdraw()
    this.report(detail.error)
  }
  private withdraw(): void {
    this.controller?.disconnect()
    for (const [input, records] of this.writes) for (const [name, item] of records) if (input.getAttribute(name) === item.last) {
      if (item.before === null) input.removeAttribute(name)
      else input.setAttribute(name, item.before)
    }
    this.writes.clear()
  }
  private own(node: Element): boolean { return node.closest("m-date-picker, [data-date-picker]") === this }
  private newInput(type: DatePickerType, index: number): HTMLInputElement {
    const input = this.ownerDocument.createElement("input"), { profile } = datePickerMode(type)
    input.type = datePickerInputType(profile)
    input.setAttribute("data-date-control", "")
    const label = this.nativeLabel(type, index)
    input.setAttribute("aria-label", label)
    this.labels.set(input, label)
    this.generated.add(input)
    return input
  }
  private nativeLabel(type: DatePickerType, index: number): string {
    const { profile, range } = datePickerMode(type)
    return range ? `${index === 0 ? "Start" : "End"} ${profile === "datetime-local" ? "date and time" : "date"}`
      : type === "datetime" ? "Local date and time" : type[0]!.toUpperCase() + type.slice(1)
  }
  private prepare(): void {
    const type = this.type, { profile, range } = datePickerMode(type)
    if (this.renderedType !== undefined && this.renderedType !== type) throw new Error("Use configure() to change Date Picker mode.")
    if (this.pendingValue !== undefined) datePickerValues(this.ownerDocument, profile, range, this.pendingValue)
    const configuredDefault = this.getAttribute("value")
    if (configuredDefault !== null) this.configuredDefault()
    this.classList.add("m-date-picker")
    this.setAttribute("data-date-picker", "")
    const fields = [...this.querySelectorAll<HTMLInputElement>("input")].filter(node => this.own(node))
    if (fields.length && fields.length !== (range ? 2 : 1)) throw new TypeError("Author exactly one native field or two range endpoints for the selected mode.")
    if (this.controls.length && (fields.length !== this.controls.length || fields.some((input, index) => input !== this.controls[index])))
      throw new Error("Keep the original Date Picker native fields.")
    if (!this.controls.length) {
      for (const input of fields) {
        if (input.type !== datePickerInputType(profile)) throw new TypeError("Authored inputs must match the selected Date Picker mode.")
        datePickerEntry(this.ownerDocument, profile, input)
        datePickerDefault(this.ownerDocument, profile, input.defaultValue)
      }
      if (!fields.length) {
        this.fields = this.ownerDocument.createElement("div")
        this.fields.className = "m-date-picker__fields"
        fields.push(this.newInput(type, 0))
        if (range) fields.push(this.newInput(type, 1))
        this.fields.append(...fields)
        this.append(this.fields)
      }
      for (const input of fields) input.setAttribute("data-date-control", "")
      this.controls = Object.freeze(fields)
      this.renderedType = type
    }
    const actions = [...this.querySelectorAll<HTMLElement>("[data-date-clear]")].filter(node => this.own(node))
    if (!actions.length) {
      const button = this.ownerDocument.createElement("button")
      button.type = "button"
      button.setAttribute("data-date-clear", "")
      button.hidden = true
      button.textContent = "Clear"
      this.append(button)
    }
    if (configuredDefault !== this.defaultAttribute && (configuredDefault !== null || this.defaultAttribute !== undefined)) {
      const value = this.configuredDefault()
      if (this.controller) this.controller.setDefaultValue(value)
    }
    this.defaultAttribute = configuredDefault
  }
  private map(input: HTMLInputElement, name: string, value: string | null): void {
    let records = this.writes.get(input)
    if (!records) { records = new Map(); this.writes.set(input, records) }
    const current = input.getAttribute(name), item = records.get(name)
    if (value === null) {
      if (item && current === item.last) {
        if (item.before === null) input.removeAttribute(name)
        else input.setAttribute(name, item.before)
      }
      records.delete(name)
      return
    }
    const before = item && current === item.last ? item.before : current
    if (current !== value) input.setAttribute(name, value)
    records.set(name, { before, last: value })
  }
  private syncSettings(): void {
    for (const [index, input] of this.controls.entries()) {
      for (const name of ["placeholder", "name", "form", "min", "max", "step", "aria-labelledby", "aria-describedby"])
        this.map(input, name, this.getAttribute(name))
      for (const name of ["disabled", "readonly", "required"]) this.map(input, name, this.hasAttribute(name) ? "" : null)
      const label = this.getAttribute("aria-label")
      this.map(input, "aria-label", label === null ? null : this.controls.length === 2 ? `${label}: ${index === 0 ? "Start" : "End"}` : label)
      if (label === null && input.getAttribute("aria-label") === this.labels.get(input)) {
        const next = this.nativeLabel(this.type, index)
        input.setAttribute("aria-label", next)
        this.labels.set(input, next)
      }
    }
    this.controller?.setClearable(this.clearable)
  }
}
