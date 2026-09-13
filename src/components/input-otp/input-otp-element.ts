import { ViewElement } from "../../core/index.js"

export type InputOtpSize = "small" | "medium" | "large"
export const inputOtpSizes: readonly InputOtpSize[] = ["small", "medium", "large"] as const

/**
 * Single-field Input OTP component for one-time passcodes.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Complete","web":"m:complete","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @region {"name":"content","accepts":["input","phrasing"],"min":0,"max":null}
 */
export class InputOtp extends ViewElement {
  public static readonly tag = "m-input-otp"
  public static readonly observedAttributes = ["value", "length", "disabled", "mask", "size"]

  #initialized = false
  #boundInputs = new Set<HTMLInputElement>()
  #wasComplete = false

  public connectedCallback(): void {
    if (!this.#initialized) {
      this.#initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-input-otp")
    this.ownerDocument.addEventListener("reset", this.#onReset, true)
    this.render()
  }

  public disconnectedCallback(): void {
    this.unbind()
    this.ownerDocument.removeEventListener("reset", this.#onReset, true)
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.#initialized && this.isConnected) {
      this.syncInputs()
    }
  }

  public get native(): HTMLInputElement | null {
    const inputs = this.childInputs()
    return inputs.length > 0 ? inputs[0]! : null
  }

  public get value(): string {
    return this.getAttribute("value") ?? ""
  }

  public set value(value: string) {
    this.setStringAttribute("value", value)
    if (this.#initialized) {
      this.syncInputs()
      this.#wasComplete = this.#checkComplete(this.value)
    }
  }

  /**
   * @integer
   * @min 1
   * @max 12
   */
  public get length(): number {
    const val = this.numberAttribute("length", 6)
    if (!Number.isInteger(val) || val < 1 || val > 12) {
      throw new RangeError("Expected an integer length between 1 and 12.")
    }
    return val
  }

  public set length(value: number) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 12) {
      throw new RangeError("Expected an integer length between 1 and 12.")
    }
    this.setAttribute("length", String(value))
    if (this.#initialized) {
      this.syncInputs()
    }
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.#initialized) {
      this.syncInputs()
    }
  }

  public get mask(): boolean {
    return this.hasAttribute("mask")
  }

  public set mask(value: boolean) {
    this.setBooleanAttribute("mask", value)
    if (this.#initialized) {
      this.syncInputs()
    }
  }

  public get size(): InputOtpSize {
    return this.choiceAttribute("size", inputOtpSizes, "medium")
  }

  public set size(value: InputOtpSize) {
    this.setChoiceAttribute("size", value, inputOtpSizes)
    if (this.#initialized) {
      this.syncInputs()
    }
  }

  public override focus(options?: FocusOptions): void {
    const input = this.native
    if (input) input.focus(options)
    else super.focus(options)
  }

  public override blur(): void {
    const input = this.native
    if (input) input.blur()
    else super.blur()
  }

  public clear(): void {
    this.value = ""
    this.#wasComplete = false
    const input = this.native
    if (input) {
      input.value = ""
    }
  }

  private childInputs(): HTMLInputElement[] {
    return [...this.querySelectorAll<HTMLInputElement>("input")].filter(
      input => input.closest("m-input-otp") === this,
    )
  }

  private unbind(): void {
    for (const input of this.#boundInputs) {
      input.removeEventListener("input", this.#onInput)
      input.removeEventListener("change", this.#onChange)
    }
    this.#boundInputs.clear()
  }

  private render(): void {
    this.unbind()
    let inputs = this.childInputs()
    if (inputs.length === 0) {
      const input = this.ownerDocument.createElement("input")
      input.className = "m-input-otp"
      input.autocomplete = "one-time-code"
      input.inputMode = "numeric"
      this.append(input)
      inputs = this.childInputs()
    } else {
      const first = inputs[0]!
      if (!this.hasAttribute("value") && first.value) {
        this.setStringAttribute("value", first.value)
        this.#wasComplete = this.#checkComplete(first.value)
      }
      if (!this.hasAttribute("length") && first.maxLength > 0) {
        this.setAttribute("length", String(first.maxLength))
      }
    }
    for (const input of inputs) {
      input.addEventListener("input", this.#onInput)
      input.addEventListener("change", this.#onChange)
      this.#boundInputs.add(input)
    }
    this.syncInputs()
  }

  private syncInputs(): void {
    const inputs = this.childInputs()
    const length = this.length
    const disabled = this.disabled
    const mask = this.mask
    const size = this.size
    const val = this.value

    this.dataset.size = size
    this.style.setProperty("--m-input-otp-length", String(length))

    for (const input of inputs) {
      input.classList.add("m-input-otp")
      input.disabled = disabled
      input.type = mask ? "password" : "text"
      input.maxLength = length
      if (!input.hasAttribute("pattern")) {
        input.pattern = `[0-9]{${length}}`
      }
      input.dataset.size = size
      input.style.setProperty("--m-input-otp-length", String(length))
      if (input.value !== val) {
        input.value = val
      }
    }
  }

  #checkComplete(val: string): boolean {
    const len = this.length
    if (val.length !== len) return false
    const input = this.native
    const pattern = input?.getAttribute("pattern")
    if (pattern) {
      try {
        return new RegExp(`^(?:${pattern})$`).test(val)
      } catch {
        return false
      }
    }
    return /^[0-9]+$/.test(val)
  }

  #onInput = (event: Event): void => {
    event.stopPropagation()
    const input = event.target as HTMLInputElement
    const newValue = input.value
    const oldValue = this.value
    if (newValue !== oldValue) {
      this.setStringAttribute("value", newValue)
      this.emit<{ value: string }>("m:change", { value: newValue }, { bubbles: true, cancelable: false, composed: false })
      const isComplete = this.#checkComplete(newValue)
      if (isComplete) {
        if (!this.#wasComplete) {
          this.#wasComplete = true
          this.emit<{ value: string }>("m:complete", { value: newValue }, { bubbles: true, cancelable: false, composed: false })
        }
      } else {
        this.#wasComplete = false
      }
    }
  }

  #onChange = (event: Event): void => {
    event.stopPropagation()
    const input = event.target as HTMLInputElement
    const newValue = input.value
    const oldValue = this.value
    if (newValue !== oldValue) {
      this.setStringAttribute("value", newValue)
      this.emit<{ value: string }>("m:change", { value: newValue }, { bubbles: true, cancelable: false, composed: false })
      const isComplete = this.#checkComplete(newValue)
      if (isComplete) {
        if (!this.#wasComplete) {
          this.#wasComplete = true
          this.emit<{ value: string }>("m:complete", { value: newValue }, { bubbles: true, cancelable: false, composed: false })
        }
      } else {
        this.#wasComplete = false
      }
    }
  }

  #onReset = (event: Event): void => {
    const input = this.native
    if (input && input.form && event.target === input.form) {
      queueMicrotask(() => {
        if (this.isConnected) {
          const val = input.value
          this.setStringAttribute("value", val || null)
          this.#wasComplete = this.#checkComplete(val)
        }
      })
    }
  }
}
