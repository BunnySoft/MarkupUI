import { ViewElement } from "../../core/index.js"

/**
 * A range slider component allowing users to select a numeric value within bounds.
 * @region {"name":"content","accepts":["input","phrasing"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"number"}}
 */
export class Slider extends ViewElement {
  public static readonly tag = "m-slider"
  public static readonly observedAttributes = [
    "value",
    "min",
    "max",
    "step",
    "disabled",
    "vertical",
    "reverse",
    "name",
    "aria-label",
    "aria-labelledby",
  ]

  private initialized = false
  private rendering = false
  private boundControl: HTMLInputElement | undefined
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-slider")
    this.render()
    this.ownerDocument.addEventListener("reset", this.onReset, true)
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.unbind()
    this.ownerDocument.removeEventListener("reset", this.onReset, true)
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.initialized && this.isConnected && !this.rendering) {
      this.syncControl()
    }
  }

  public get value(): number { return this.numberAttribute("value", 0) }
  public set value(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid number value.")
    this.setAttribute("value", String(value))
    const control = this.childInput()
    if (control) {
      control.value = String(value)
      if (control.valueAsNumber !== value && Number.isFinite(control.valueAsNumber)) {
        this.setAttribute("value", String(control.valueAsNumber))
      }
    }
    this.updateOutput()
  }

  public get min(): number { return this.numberAttribute("min", 0) }
  public set min(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid number min.")
    this.setAttribute("min", String(value))
    const control = this.childInput()
    if (control) control.min = String(value)
  }

  public get max(): number { return this.numberAttribute("max", 100) }
  public set max(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid number max.")
    this.setAttribute("max", String(value))
    const control = this.childInput()
    if (control) control.max = String(value)
  }

  public get step(): number { return this.numberAttribute("step", 1) }
  public set step(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) throw new RangeError("Invalid number step.")
    this.setAttribute("step", String(value))
    const control = this.childInput()
    if (control) control.step = String(value)
  }

  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    const control = this.childInput()
    if (control) control.disabled = value
  }

  public get vertical(): boolean { return this.hasAttribute("vertical") }
  public set vertical(value: boolean) {
    this.setBooleanAttribute("vertical", value)
    if (value) this.setAttribute("data-vertical", "")
    else this.removeAttribute("data-vertical")
  }

  public get reverse(): boolean { return this.hasAttribute("reverse") }
  public set reverse(value: boolean) {
    this.setBooleanAttribute("reverse", value)
    const control = this.childInput()
    if (control) {
      if (value) control.dir = "rtl"
      else control.removeAttribute("dir")
    }
  }

  public override focus(options?: FocusOptions): void {
    const control = this.childInput()
    if (control) control.focus(options)
    else super.focus(options)
  }

  public override blur(): void {
    const control = this.childInput()
    if (control) control.blur()
    else super.blur()
  }

  public stepUp(n?: number): void {
    const control = this.childInput()
    if (control) {
      control.stepUp(n)
      const val = control.valueAsNumber
      this.setAttribute("value", String(val))
      this.updateOutput()
      this.emit<{ value: number }>("m:change", { value: val }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  public stepDown(n?: number): void {
    const control = this.childInput()
    if (control) {
      control.stepDown(n)
      const val = control.valueAsNumber
      this.setAttribute("value", String(val))
      this.updateOutput()
      this.emit<{ value: number }>("m:change", { value: val }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private childInput(): HTMLInputElement | null {
    return this.querySelector<HTMLInputElement>("input[type=range], input[data-slider-control]")
      ?? this.querySelector<HTMLInputElement>("input")
  }

  private render(): void {
    this.rendering = true
    try {
      let control = this.childInput()
      if (!control) {
        control = this.ownerDocument.createElement("input")
        control.type = "range"
        control.setAttribute("data-slider-control", "")
        control.defaultValue = String(this.value)
        this.append(control)
      } else {
        if (!this.hasAttribute("min") && (control.hasAttribute("min") || control.min !== "")) {
          this.setAttribute("min", control.min)
        }
        if (!this.hasAttribute("max") && (control.hasAttribute("max") || control.max !== "")) {
          this.setAttribute("max", control.max)
        }
        if (!this.hasAttribute("step") && (control.hasAttribute("step") || control.step !== "")) {
          this.setAttribute("step", control.step)
        }
        if (!this.hasAttribute("value") && (control.hasAttribute("value") || control.value !== "")) {
          this.setAttribute("value", control.value)
        }
        if (!this.hasAttribute("disabled") && control.disabled) {
          this.disabled = true
        }
      }

      if (control !== this.boundControl) {
        this.unbind()
        control.addEventListener("input", this.onInput)
        control.addEventListener("change", this.onChange)
        this.boundControl = control
      }

      this.syncControl()

      this.observer ??= new MutationObserver(() => {
        const current = this.childInput()
        if (current !== this.boundControl) {
          this.render()
        }
      })
      this.observer.observe(this, { childList: true })
    } finally {
      this.rendering = false
    }
  }

  private unbind(): void {
    if (this.boundControl) {
      this.boundControl.removeEventListener("input", this.onInput)
      this.boundControl.removeEventListener("change", this.onChange)
      this.boundControl = undefined
    }
  }

  private syncControl(): void {
    const control = this.childInput()
    if (!control) return
    control.min = String(this.min)
    control.max = String(this.max)
    control.step = String(this.step)
    control.disabled = this.disabled
    control.value = String(this.value)
    if (this.reverse) {
      control.dir = "rtl"
    } else if (control.getAttribute("dir") === "rtl" && !this.hasAttribute("reverse")) {
      control.removeAttribute("dir")
    }
    if (this.vertical) {
      this.setAttribute("data-vertical", "")
    } else {
      this.removeAttribute("data-vertical")
    }
    for (const attr of ["name", "aria-label", "aria-labelledby"]) {
      if (this.hasAttribute(attr)) {
        control.setAttribute(attr, this.getAttribute(attr)!)
      } else {
        control.removeAttribute(attr)
      }
    }
    this.updateOutput()
  }

  private updateOutput(): void {
    const output = this.querySelector<HTMLOutputElement>("output[data-slider-output], output")
    if (output) {
      output.value = String(this.value)
      output.hidden = false
    }
  }

  private onInput = (_event: Event): void => {
    const control = this.childInput()
    if (!control) return
    const val = control.valueAsNumber
    if (this.value !== val) {
      this.setAttribute("value", String(val))
      this.updateOutput()
      this.emit<{ value: number }>("m:change", { value: val }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private onChange = (_event: Event): void => {
    const control = this.childInput()
    if (!control) return
    const val = control.valueAsNumber
    if (this.value !== val) {
      this.setAttribute("value", String(val))
      this.updateOutput()
      this.emit<{ value: number }>("m:change", { value: val }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private onReset = (event: Event): void => {
    const control = this.childInput()
    if (control && event.target === control.form) {
      setTimeout(() => {
        if (this.isConnected) {
          this.setAttribute("value", String(control.valueAsNumber))
          this.updateOutput()
        }
      }, 0)
    }
  }
}
