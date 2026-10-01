import { ViewElement } from "../../core/index.js"
import {
  createSlider, createSliderPair, createSliderControl, sliderConstraint, sliderNativeConstraint,
  sliderNumbers, sliderValueAttribute,
} from "./slider.js"
import type { SliderController, SliderPairController, SliderValue, SliderDefaultValue, SliderStep, SliderOptions } from "./slider.js"

let nextId = 0

/**
 * One native range, or two independent native tracks in range mode.
 * Generated single controls default to 0; authored value-less controls keep the native midpoint.
 * @region {"name":"content","accepts":["input","fieldset","phrasing"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"SliderValue","ordered":"boolean | undefined","index":"number | undefined"}}
 * @event {"name":"PairChange","web":"m:slider-pair-change","bubbles":false,"cancelable":false,"composed":false,"detail":{"value":"[number, number]","ordered":"boolean","index":"number"}}
 * @event {"name":"Error","web":"m:error","bubbles":true,"cancelable":false,"composed":false,"detail":{"message":"string"}}
 */
export class Slider extends ViewElement {
  public static readonly tag = "m-slider"
  public static readonly observedAttributes = [
    "range", "value", "min", "max", "step", "disabled", "readonly", "vertical", "reverse", "name", "form",
    "aria-label", "aria-labelledby", "role", "tabindex",
  ]

  private initialized = false
  private mapping = false
  private connecting = false
  private generation = 0
  private controller: SliderController | SliderPairController | undefined
  private root: HTMLElement | undefined
  private controls: HTMLInputElement[] = []
  private mode: boolean | undefined
  private formatter: SliderOptions["formatValue"]
  private pendingDefault: SliderDefaultValue | undefined
  private pending = new Set<string>()
  private failure: string | null = null

  public connectedCallback(): void {
    try {
      if (!this.initialized) {
        this.upgradeProperties()
        this.initialized = true
        for (const name of Slider.observedAttributes) if (this.hasAttribute(name)) this.pending.add(name)
      }
      this.connect()
    } catch (reason) { this.report(reason) }
  }

  public disconnectedCallback(): void {
    this.generation++
    this.controller?.disconnect()
    this.controller = undefined
    this.root?.removeEventListener("m:slider-error", this.onError)
  }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || this.mapping) return
    this.pending.add(name)
    if (this.connecting) { this.generation++; return }
    if (!this.initialized || !this.isConnected) return
    try {
      if (!this.controller) this.connect()
      else this.apply(name)
      this.failure = null
    } catch (reason) { this.report(reason) }
  }

  /** Set before native controls are materialized. Range values are JSON tuples in attributes. */
  public get range(): boolean { return this.hasAttribute("range") }
  public set range(value: boolean) {
    if (typeof value !== "boolean") throw new TypeError("Slider range needs a boolean.")
    if (this.mode !== undefined && value !== this.mode) throw new Error("Set Slider range before native controls are materialized.")
    this.setBooleanAttribute("range", value)
  }

  /** Live native value; silent writes clamp independently and never sort. The value attribute uses a scalar number or JSON tuple. */
  public get value(): SliderValue {
    if (this.controller) return this.controller.value
    if (this.controls.length) return this.mode ? [this.controls[0]!.valueAsNumber, this.controls[1]!.valueAsNumber] : this.controls[0]!.valueAsNumber
    const value = this.attributes.getNamedItem("value")?.value ?? null
    return sliderValueAttribute(value, this.range ? 2 : 1)
  }
  public set value(value: SliderValue) {
    const numbers = sliderNumbers(value, this.range ? 2 : 1)
    if (this.controller) {
      if ("control" in this.controller) this.controller.setValue(numbers[0]!)
      else this.controller.setValue([numbers[0]!, numbers[1]!])
    }
    this.mapping = true
    try { this.setAttribute("value", this.range ? JSON.stringify(this.controller?.value ?? numbers) : String(this.controller?.value ?? numbers[0])) }
    finally { this.mapping = false }
    if (!this.controller) this.pending.add("value")
    if (this.connecting && !this.controller) this.generation++
    this.failure = null
  }

  /** Native value-attribute strings, including "" for an absent authored default. Independent of live value. */
  public get defaultValue(): SliderDefaultValue {
    if (this.pendingDefault !== undefined) return this.pendingDefault
    if (this.controller) return this.controller.defaultValue
    if (this.controls.length) return this.mode ? [this.controls[0]!.defaultValue, this.controls[1]!.defaultValue] : this.controls[0]!.defaultValue
    return this.range ? ["0", "100"] : "0"
  }
  public set defaultValue(value: SliderDefaultValue) {
    if (this.range ? !Array.isArray(value) || value.length !== 2 || value.some(item => typeof item !== "string") : typeof value !== "string") {
      throw new TypeError("Slider defaults need a native string, or two strings in range mode.")
    }
    if (this.controller) {
      if ("control" in this.controller && typeof value === "string") this.controller.setDefaultValue(value)
      else if (!("control" in this.controller) && typeof value !== "string") this.controller.setDefaultValue(value)
      else throw new TypeError("Slider default shape does not match its native mode.")
    } else {
      this.pendingDefault = typeof value === "string" ? value : [value[0], value[1]]
      if (this.connecting) this.generation++
    }
    this.failure = null
  }

  /** Reads the first native track; setting applies to both tracks. Per-track bounds remain available through native. */
  public get min(): number { return this.constraint("min") }
  public set min(value: number) { sliderConstraint("min", value); this.controller?.setMin(value); this.reflect("min", String(value)) }
  public get max(): number { return this.constraint("max") }
  public set max(value: number) { sliderConstraint("max", value); this.controller?.setMax(value); this.reflect("max", String(value)) }
  public get step(): SliderStep { return this.constraint("step") }
  public set step(value: SliderStep) { sliderConstraint("step", value); this.controller?.setStep(value); this.reflect("step", String(value)) }

  /** Range mode uses the actual fieldset; ancestor fieldset disabling remains native. */
  public get disabled(): boolean {
    return this.mode && this.root ? (this.root as HTMLFieldSetElement).disabled : this.controls[0]?.disabled ?? this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    if (typeof value !== "boolean") throw new TypeError("Slider disabled needs a boolean.")
    this.controller?.setDisabled(value); this.reflect("disabled", value ? "" : null)
  }
  /** Native range does not support readonly. True is explicitly rejected, never emulated. */
  public get readonly(): false { return false }
  public set readonly(value: boolean) {
    if (value !== false) throw new TypeError("Native range does not support readonly; use disabled when appropriate.")
    this.removeAttribute("readonly")
  }
  public get vertical(): boolean { return this.hasAttribute("vertical") }
  public set vertical(value: boolean) {
    if (typeof value !== "boolean") throw new TypeError("Slider vertical needs a boolean.")
    this.controller?.setVertical(value); this.reflect("vertical", value ? "" : null)
  }
  public get reverse(): boolean { return this.hasAttribute("reverse") }
  public set reverse(value: boolean) {
    if (typeof value !== "boolean") throw new TypeError("Slider reverse needs a boolean.")
    this.controller?.setReverse(value); this.reflect("reverse", value ? "" : null)
  }
  /** In range mode a common name submits two native entries, not a hidden serialized tuple. */
  public get name(): string | null {
    return this.controls.length ? this.controls[0]!.getAttribute("name") : this.getAttribute("name")
  }
  public set name(value: string | null) {
    if (value !== null && typeof value !== "string") throw new TypeError("Slider name needs a string or null.")
    this.controller?.setName(value); this.reflect("name", value)
  }
  public get form(): HTMLFormElement | null { return this.controls[0]?.form ?? null }
  public get labels(): readonly HTMLLabelElement[] { return this.controls.flatMap(control => [...control.labels ?? []]) }
  /** Web inspection/interop only; the native nodes retain keyboard, focus, labels, validity and form ownership. */
  public get native(): HTMLInputElement | readonly [HTMLInputElement, HTMLInputElement] | null {
    return this.controls.length ? this.mode ? [this.controls[0]!, this.controls[1]!] : this.controls[0]! : null
  }
  public get ordered(): boolean {
    if (this.controller && "ordered" in this.controller) return this.controller.ordered
    if (this.mode) throw new Error("Range Slider needs a connected native owner to read ordered.")
    return true
  }
  public get error(): string | null { return this.failure ?? this.controller?.error ?? null }
  /** Accepted only after all formatted strings are prepared successfully; stale/reentrant work cannot commit. */
  public get formatValue(): SliderOptions["formatValue"] { return this.formatter }
  public set formatValue(value: SliderOptions["formatValue"]) {
    if (value !== undefined && typeof value !== "function") throw new TypeError("Slider formatValue must be a function or undefined.")
    this.controller?.setFormatValue(value)
    this.formatter = value
    this.generation++
    this.failure = null
  }

  public override focus(options?: FocusOptions): void { this.controls[0]?.focus(options) }
  public override blur(): void { this.controls.forEach(control => control.blur()) }
  /** Native stepping with the existing m:change action notification; never fabricates native input/change. step="any" throws natively. */
  public stepUp(n?: number, index?: number): void { this.requireController().stepUp(n, index) }
  public stepDown(n?: number, index?: number): void { this.requireController().stepDown(n, index) }
  public checkValidity(): boolean {
    this.requireController()
    return this.controls.map(control => control.checkValidity()).every(Boolean)
  }
  public reportValidity(): boolean {
    this.requireController()
    return this.controls.every(control => control.reportValidity())
  }
  /** Refresh after direct native property writes, or retry an explicitly reported connection gate. */
  public refresh(): void {
    if (!this.isConnected) throw new Error("Slider is disconnected.")
    if (!this.controller?.connected) this.connect()
    else this.controller.refresh()
    this.failure = null
  }

  private constraint(name: "min" | "max"): number
  private constraint(name: "step"): SliderStep
  private constraint(name: "min" | "max" | "step"): number | "any" {
    if (this.controls.length) return sliderNativeConstraint(this.controls[0], name)
    const value = this.getAttribute(name)
    return value === null ? sliderNativeConstraint(undefined, name) : sliderConstraint(name, value === "any" ? value : this.numberAttribute(name, 0))
  }

  private reflect(name: string, value: string | null): void {
    this.mapping = true
    try {
      if (value === null) this.removeAttribute(name)
      else this.setAttribute(name, value)
    } finally { this.mapping = false }
    if (!this.controller) this.pending.add(name)
    if (this.connecting && !this.controller) this.generation++
    this.failure = null
  }

  private connect(): void {
    if (this.controller?.connected) return
    this.controller = undefined
    if (this.connecting) throw new Error("Slider connection was superseded during formatValue.")
    if (this.mode !== undefined && this.range !== this.mode) throw new Error("Set Slider range before native controls are materialized.")
    if (this.hasAttribute("readonly")) throw new TypeError("Native range does not support readonly.")
    if (this.hasAttribute("role") || this.hasAttribute("tabindex") || this.closest("label, button, a[href], summary")) {
      throw new TypeError("Slider host must not replace the native role, tabstop or label owner.")
    }
    if (!this.root) this.materialize()
    const root = this.root!
    const generation = ++this.generation
    this.connecting = true
    root.addEventListener("m:slider-error", this.onError)
    try {
      const options: SliderOptions = this.formatter ? { formatValue: this.formatter } : {}
      this.controller = this.mode ? createSliderPair(root as HTMLFieldSetElement, options) : createSlider(root, options)
      this.controls = "control" in this.controller ? [this.controller.control] : [...this.controller.controls]
      if (generation !== this.generation || !this.isConnected) throw new Error("Slider connection was superseded during formatValue.")
      for (const name of ["aria-label", "aria-labelledby", "vertical", "reverse"]) if (this.hasAttribute(name)) this.pending.add(name)
      for (const name of [...this.pending].filter(name => name !== "value")) this.apply(name)
      if (this.pendingDefault !== undefined) {
        const value = this.pendingDefault
        this.defaultValue = value
        this.pendingDefault = undefined
      }
      if (this.pending.has("value")) this.apply("value")
      this.failure = null
    } catch (reason) {
      this.controller?.disconnect(); this.controller = undefined
      root.removeEventListener("m:slider-error", this.onError)
      throw reason
    } finally { this.connecting = false }
  }

  private materialize(): void {
    const count = this.range ? 2 : 1
    const controls = [...this.querySelectorAll<HTMLInputElement>("input")].filter(control => control.closest("m-slider") === this)
    if (controls.length && (controls.length !== count || controls.some(control => control.type !== "range"))) {
      throw new TypeError(`Slider needs exactly ${count} native range control${count === 2 ? "s" : ""}.`)
    }
    let root: HTMLElement = this
    if (this.range) {
      const fieldsets = [...this.querySelectorAll<HTMLFieldSetElement>("fieldset")].filter(node => node.closest("m-slider") === this)
      if (fieldsets.length > 1) throw new TypeError("Range Slider needs one native fieldset.")
      if (fieldsets[0]) root = fieldsets[0]
      else {
        const fieldset = this.ownerDocument.createElement("fieldset")
        const legend = this.ownerDocument.createElement("legend")
        legend.textContent = this.getAttribute("aria-label")?.trim() || "Slider range"
        fieldset.append(legend, ...this.childNodes)
        this.append(fieldset); root = fieldset
      }
      root.classList.add("m-slider-pair"); root.setAttribute("data-slider-pair", "")
    } else {
      root.classList.add("m-slider"); root.setAttribute("data-slider", "")
    }
    if (!controls.length) {
      for (let index = 0; index < count; index++) {
        const control = createSliderControl(this.ownerDocument, index, count, this.getAttribute("value"))
        root.append(control); controls.push(control)
      }
    } else for (const control of controls) control.setAttribute("data-slider-control", "")
    for (const output of [...root.querySelectorAll("output")].filter(node => node.closest("m-slider") === this)) {
      if (count === 1 && !output.hasAttribute("for")) {
        const control = controls[0]!
        if (!control.id) {
          let id: string
          do { id = `m-slider-control-${++nextId}` } while (this.ownerDocument.getElementById(id))
          control.id = id
        }
        output.htmlFor.value = control.id
      }
      if (!output.hasAttribute("aria-live")) output.setAttribute("aria-live", "off")
      output.setAttribute("data-slider-output", "")
    }
    this.mode = this.range; this.root = root; this.controls = controls
  }

  private apply(name: string): void {
    const controller = this.requireController()
    const value = this.getAttribute(name)
    switch (name) {
      case "range": if (this.range !== this.mode) throw new Error("Set Slider range before native controls are materialized."); break
      case "readonly": if (value !== null) throw new TypeError("Native range does not support readonly."); break
      case "role": case "tabindex": if (value !== null) throw new TypeError("Slider host must not replace the native role or tabstop."); break
      case "value":
        if (value !== null) {
          const numbers = sliderNumbers(sliderValueAttribute(value, this.range ? 2 : 1), this.range ? 2 : 1)
          if ("control" in controller) controller.setValue(numbers[0]!)
          else controller.setValue([numbers[0]!, numbers[1]!])
        }
        break
      case "min": controller.setMin(value === null ? null : this.numberAttribute("min", 0)); break
      case "max": controller.setMax(value === null ? null : this.numberAttribute("max", 100)); break
      case "step": controller.setStep(value === null ? null : value === "any" ? value : this.numberAttribute("step", 1)); break
      case "disabled": controller.setDisabled(this.hasAttribute(name)); break
      case "name": controller.setName(value); break
      case "form": controller.setForm(value); break
      case "aria-label": case "aria-labelledby": controller.setAccessibleName(this.getAttribute("aria-label"), this.getAttribute("aria-labelledby")); break
      case "vertical": controller.setVertical(this.vertical); break
      case "reverse": controller.setReverse(this.reverse); break
    }
    this.pending.delete(name)
  }

  private requireController(): SliderController | SliderPairController {
    if (!this.controller?.connected) throw new Error("Slider has no connected native owner; fix the reported gate and refresh.")
    return this.controller
  }
  private report(reason: unknown): void {
    const message = reason instanceof Error ? reason.message : String(reason)
    if (this.failure !== message) {
      this.failure = message
      this.emit("m:error", { message }, { bubbles: true, cancelable: false, composed: false })
    }
  }
  private onError = (event: Event): void => { this.report((event as CustomEvent<{ message: string }>).detail.message) }
}
