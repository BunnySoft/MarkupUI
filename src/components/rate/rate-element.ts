import { ViewElement } from "../../core/index.js"
import { createRate, readRateDefaultValue, readRateForm, readRateName, readRateValue, validateRateScore, validateRateOptions, validateRateSchema } from "./rate.js"
import type { RateController, RateOptions } from "./rate.js"

export type RateSize = "small" | "medium" | "large"
export const rateSizes: readonly RateSize[] = ["small", "medium", "large"] as const

/**
 * Native rating choices, with one fieldset/radio owner shared with createRate.
 * @region {"name":"content","accepts":["phrasing","text"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"number | null"}}
 * @event {"name":"Clear","web":"m:rate-clear","bubbles":false,"cancelable":false,"composed":false,"detail":{"previous":"number","value":"null"}}
 * @event {"name":"Error","web":"m:rate-error","bubbles":false,"cancelable":false,"composed":false,"detail":{"message":"string"}}
 */
export class Rate extends ViewElement {
  public static readonly tag = "m-rate"
  public static readonly observedAttributes = [
    "value", "default-value", "count", "allow-half", "disabled", "readonly",
    "clearable", "size", "name", "form", "label",
  ]

  private fieldset: HTMLFieldSetElement | null = null
  private controller: RateController | null = null
  private initialized = false
  private connectedOnce = false
  private pending = new Set<string>()
  private fallbackName = "m-rate-" + Math.random().toString(36).slice(2, 9)

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    const first = !this.connectedOnce
    const root = this.native
    this.syncSize()
    const options = this.options(first)
    this.controller = createRate(root, options)
    this.connectedOnce = true
    this.pending.clear()
  }

  public disconnectedCallback(): void {
    this.controller?.disconnect()
    this.controller = null
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.controller?.connected) {
      this.pending.add(name)
      return
    }
    try {
      if (name === "size") this.syncSize()
      else if (name === "value") this.controller.setValue(this.scoreAttribute("value", this.generated ? 0 : null))
      else if (name === "default-value") this.controller.setDefaultValue(this.scoreAttribute("default-value", null))
      else if (name === "label") this.syncLabel()
      else if (name === "disabled") this.controller.configure({ disabled: this.hasAttribute("disabled") })
      else if (name === "name") this.controller.configure({ name: this.getAttribute("name") ?? this.name })
      else if (name === "form") this.controller.configure({ form: this.getAttribute("form") })
      else this.controller.configure(this.options(false))
    } catch (reason) {
      this.native.dispatchEvent(new this.ownerDocument.defaultView!.CustomEvent("m:rate-error", {
        detail: { message: reason instanceof Error ? reason.message : String(reason) },
      }))
      throw reason
    }
  }

  private get generated(): boolean {
    return this.fieldset?.getAttribute("data-state") === "generated"
  }

  /** The sole native semantic owner. Authored fieldsets, controls and labels are adopted intact. */
  public get native(): HTMLFieldSetElement {
    const authored = [...this.children].filter((node): node is HTMLFieldSetElement =>
      node instanceof this.ownerDocument.defaultView!.HTMLFieldSetElement)
    if (authored.length > 1) throw new TypeError("Rate needs one native fieldset.")
    if (this.fieldset) {
      if (this.fieldset.parentElement !== this) throw new TypeError("Rate native fieldset was removed; retain its owner.")
      return this.fieldset
    }
    const root = authored[0] ?? this.ownerDocument.createElement("fieldset")
    if (!authored.length) {
      root.className = "m-rate m-radio-group"
      root.setAttribute("data-rate", "")
      root.setAttribute("data-radio-group", "")
      root.setAttribute("data-rate-cumulative", "")
      root.setAttribute("data-part", "rate")
      root.setAttribute("data-state", "generated")
      const legend = this.ownerDocument.createElement("legend")
      legend.setAttribute("data-part", "label")
      legend.textContent = this.label
      root.append(legend)
      root.append(...this.childNodes)
      this.append(root)
    }
    this.fieldset = root
    return root
  }

  /**
   * Live native selection; null is unselected, zero is an actual score.
   * Generated choices initially select 0; authored checkedness is never inferred from an absent attribute.
   */
  public get value(): number | null {
    if (this.pending.has("value") || !this.fieldset || !this.connectedOnce && this.generated) return this.scoreAttribute("value", 0)
    return this.controller?.connected ? this.controller.value : readRateValue(this.fieldset)
  }
  public set value(value: number | null) {
    validateRateScore(value, this.count, this.allowHalf)
    if (this.controller?.connected) this.controller.setValue(value)
    this.setAttribute("value", String(value))
  }

  /** Native checked defaults, independent of live selection after initialization and programmatic writes. */
  public get defaultValue(): number | null {
    if (this.pending.has("default-value") || !this.fieldset || !this.connectedOnce && this.generated) {
      return this.scoreAttribute("default-value", this.scoreAttribute("value", 0))
    }
    return readRateDefaultValue(this.fieldset)
  }
  public set defaultValue(value: number | null) {
    validateRateScore(value, this.count, this.allowHalf)
    if (this.controller?.connected) this.controller.setDefaultValue(value)
    this.setAttribute("default-value", String(value))
  }

  /** @min 1 @integer */
  public get count(): number {
    const raw = this.getAttribute("count")
    const count = raw === null ? 5 : Number(raw)
    validateRateOptions({ count })
    return this.numberAttribute("count", 5)
  }
  public set count(value: number) {
    validateRateOptions({ count: value })
    if (this.controller?.connected) this.controller.configure({ count: value })
    else if (this.fieldset) validateRateSchema(this.fieldset, { count: value, allowHalf: this.allowHalf })
    this.setAttribute("count", String(value))
  }

  public get allowHalf(): boolean { return this.hasAttribute("allow-half") }
  public set allowHalf(value: boolean) {
    validateRateOptions({ allowHalf: value })
    if (this.controller?.connected) this.controller.configure({ allowHalf: value })
    else if (this.fieldset) validateRateSchema(this.fieldset, { count: this.count, allowHalf: value })
    this.setBooleanAttribute("allow-half", value)
  }

  public get disabled(): boolean { return this.hasAttribute("disabled") || this.fieldset?.disabled === true }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get readonly(): boolean { return this.hasAttribute("readonly") }
  public set readonly(value: boolean) { this.setBooleanAttribute("readonly", value) }
  public get clearable(): boolean { return this.hasAttribute("clearable") }
  public set clearable(value: boolean) { this.setBooleanAttribute("clearable", value) }
  public get size(): RateSize { return this.choiceAttribute("size", rateSizes, "medium") }
  public set size(value: RateSize) { this.setChoiceAttribute("size", value, rateSizes) }

  /** An explicit name maps to all native members. Otherwise authored names survive; generated names are instance-specific. */
  public get name(): string {
    const configured = this.attributes.getNamedItem("name")?.value
    const native = this.controller?.connected ? this.controller.name : this.fieldset ? readRateName(this.fieldset) : null
    return native ?? configured ?? this.fallbackName
  }
  public set name(value: string) {
    validateRateOptions({ name: value })
    this.setAttribute("name", value)
  }

  /** Actual common native form association, including external input form attributes. */
  public get form(): HTMLFormElement | null {
    return this.controller?.connected ? this.controller.form : this.fieldset ? readRateForm(this.fieldset) : null
  }
  /** Generated legend text. Authored legends and external labels remain application-owned. */
  public get label(): string { return this.getAttribute("label") ?? "Rating" }
  public set label(value: string) {
    if (typeof value !== "string" || !value.trim()) throw new TypeError("Rate label must be nonempty text.")
    this.setAttribute("label", value)
  }
  public get error(): string | null { return this.controller?.error ?? null }

  public override focus(options?: FocusOptions): void { this.controller?.focus(options) }
  public override blur(): void { this.controller?.blur() }
  public clear(): boolean {
    if (!this.controller?.connected) throw new Error("Rate is disconnected.")
    return this.controller.clear()
  }
  public setValue(value: number | null): void { this.value = value }
  public refresh(): void {
    if (!this.controller?.connected) throw new Error("Rate is disconnected.")
    void this.native
    this.controller.refresh()
  }

  private scoreAttribute(name: string, fallback: number | null): number | null {
    const raw = this.getAttribute(name)
    if (raw === null) return fallback
    const value = raw === "null" ? null : raw.trim() ? Number(raw) : NaN
    validateRateScore(value, this.count, this.allowHalf)
    return value
  }

  private options(first: boolean): RateOptions {
    const options: RateOptions = {
      count: this.count, allowHalf: this.allowHalf, readonly: this.readonly, clearable: this.clearable,
    }
    if (first && (this.generated || this.hasAttribute("disabled")) || this.pending.has("disabled")) options.disabled = this.hasAttribute("disabled")
    if (first && (this.generated || this.hasAttribute("name")) || this.pending.has("name")) options.name = this.getAttribute("name") ?? this.name
    if (first && (this.generated || this.hasAttribute("form")) || this.pending.has("form")) options.form = this.getAttribute("form")
    if (first && (this.generated || this.hasAttribute("value")) || this.pending.has("value")) {
      options.value = this.scoreAttribute("value", this.generated ? 0 : null)
    }
    if (first && this.hasAttribute("default-value") || this.pending.has("default-value")) {
      options.defaultValue = this.scoreAttribute("default-value", null)
    }
    return options
  }

  private syncSize(): void {
    if (this.generated || this.hasAttribute("size")) this.native.setAttribute("data-size", this.size)
  }
  private syncLabel(): void {
    if (this.generated) this.native.querySelector('[data-part="label"]')!.textContent = this.label
  }
}
