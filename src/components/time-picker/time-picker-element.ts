import { ViewElement } from "../../core/index.js"

export type TimePickerSize = "small" | "medium" | "large"
export const timePickerSizes: readonly TimePickerSize[] = ["small", "medium", "large"] as const

/**
 * TimePicker component for selecting time of day.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @region {"name":"content","accepts":["input","phrasing"],"min":0,"max":null}
 */
export class TimePicker extends ViewElement {
  public static readonly tag = "m-time-picker"
  public static readonly observedAttributes = [
    "value",
    "placeholder",
    "format",
    "clearable",
    "disabled",
    "step",
    "size",
  ]

  private initialized = false
  private boundInputs = new Set<HTMLInputElement>()
  private boundClear: HTMLButtonElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-time-picker")
    this.render()
  }

  public disconnectedCallback(): void {
    this.unbind()
  }

  public attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null): void {
    if (this.initialized && this.isConnected) {
      this.syncInputs()
    }
  }

  public get value(): string | null {
    return this.getAttribute("value")
  }

  public set value(value: string | null) {
    this.setStringAttribute("value", value)
    if (this.initialized) this.syncInputs()
  }

  public get placeholder(): string | null {
    return this.getAttribute("placeholder")
  }

  public set placeholder(value: string | null) {
    this.setStringAttribute("placeholder", value)
    if (this.initialized) this.syncInputs()
  }

  public get format(): string | null {
    return this.getAttribute("format")
  }

  public set format(value: string | null) {
    this.setStringAttribute("format", value)
  }

  public get clearable(): boolean {
    return this.hasAttribute("clearable")
  }

  public set clearable(value: boolean) {
    this.setBooleanAttribute("clearable", value)
    if (this.initialized) this.syncInputs()
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.initialized) this.syncInputs()
  }

  public get step(): string | null {
    return this.getAttribute("step")
  }

  public set step(value: string | null) {
    this.setStringAttribute("step", value)
    if (this.initialized) this.syncInputs()
  }

  public get size(): TimePickerSize {
    return this.choiceAttribute("size", timePickerSizes, "medium")
  }

  public set size(value: TimePickerSize) {
    this.setChoiceAttribute("size", value, timePickerSizes)
    if (this.initialized) this.syncInputs()
  }

  public override focus(options?: FocusOptions): void {
    const input = this.childInput()
    input?.focus(options)
  }

  public override blur(): void {
    const input = this.childInput()
    input?.blur()
  }

  public clear(): void {
    this.value = null
    const inputs = this.childInputs()
    for (const input of inputs) {
      input.value = ""
    }
    this.emit<{ value: string }>("m:change", { value: "" }, { bubbles: true, cancelable: false, composed: false })
  }

  private childInput(): HTMLInputElement | null {
    return this.childInputs()[0] ?? null
  }

  private childInputs(): HTMLInputElement[] {
    return [...this.querySelectorAll<HTMLInputElement>("input")].filter(
      input => input.closest("m-time-picker") === this,
    )
  }

  private unbind(): void {
    for (const input of this.boundInputs) {
      input.removeEventListener("input", this.onInputChange)
      input.removeEventListener("change", this.onInputChange)
    }
    this.boundInputs.clear()
    if (this.boundClear) {
      this.boundClear.removeEventListener("click", this.onClearClick)
      this.boundClear = undefined
    }
  }

  private render(): void {
    this.unbind()
    let inputs = this.childInputs()
    if (inputs.length === 0) {
      const input = this.ownerDocument.createElement("input")
      input.type = "time"
      input.setAttribute("data-time-control", "")
      this.append(input)
      inputs = this.childInputs()
    }

    let clearBtn = this.querySelector<HTMLButtonElement>("[data-time-clear]")
    if (this.clearable && !clearBtn) {
      clearBtn = this.ownerDocument.createElement("button")
      clearBtn.type = "button"
      clearBtn.setAttribute("data-time-clear", "")
      clearBtn.setAttribute("aria-label", "Clear time")
      clearBtn.textContent = "Clear"
      this.append(clearBtn)
    }

    for (const input of inputs) {
      input.addEventListener("input", this.onInputChange)
      input.addEventListener("change", this.onInputChange)
      this.boundInputs.add(input)
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", this.onClearClick)
      this.boundClear = clearBtn
    }

    this.syncInputs()
  }

  private syncInputs(): void {
    const inputs = this.childInputs()
    const disabled = this.disabled
    const placeholder = this.placeholder
    const step = this.step
    const val = this.value
    const size = this.size

    this.setAttribute("data-size", size)

    for (const input of inputs) {
      input.disabled = disabled
      if (placeholder !== null) {
        input.placeholder = placeholder
      } else {
        input.removeAttribute("placeholder")
      }
      if (step !== null) {
        input.step = step
      } else {
        input.removeAttribute("step")
      }
    }

    let clearBtn = this.querySelector<HTMLButtonElement>("[data-time-clear]")
    if (this.clearable && !clearBtn && this.isConnected) {
      clearBtn = this.ownerDocument.createElement("button")
      clearBtn.type = "button"
      clearBtn.setAttribute("data-time-clear", "")
      clearBtn.setAttribute("aria-label", "Clear time")
      clearBtn.textContent = "Clear"
      clearBtn.addEventListener("click", this.onClearClick)
      this.boundClear = clearBtn
      this.append(clearBtn)
    }

    if (clearBtn) {
      clearBtn.disabled = disabled
      clearBtn.hidden = !this.clearable
    }

    const firstInput = inputs[0]
    if (firstInput) {
      firstInput.value = val ?? ""
    }
  }

  private onInputChange = (event: Event): void => {
    event.stopPropagation()
    const input = this.childInput()
    const newValue = input?.value || null
    if (this.value !== newValue) {
      this.setStringAttribute("value", newValue)
      this.emit<{ value: string }>("m:change", { value: newValue ?? "" }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private onClearClick = (event: MouseEvent): void => {
    event.preventDefault()
    this.clear()
  }
}
