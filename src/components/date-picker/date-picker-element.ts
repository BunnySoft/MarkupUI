import { ViewElement } from "../../core/index.js"

export type DatePickerType = "date" | "datetime" | "daterange" | "datetimerange" | "month" | "year" | "quarter"
export const datePickerTypes: readonly DatePickerType[] = [
  "date",
  "datetime",
  "daterange",
  "datetimerange",
  "month",
  "year",
  "quarter",
] as const

/**
 * DatePicker component for selecting dates, times, and date ranges.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @region {"name":"content","accepts":["input","phrasing"],"min":0,"max":null}
 */
export class DatePicker extends ViewElement {
  public static readonly tag = "m-date-picker"
  public static readonly observedAttributes = ["value", "type", "placeholder", "clearable", "disabled", "format"]

  private initialized = false
  private boundInputs = new Set<HTMLInputElement>()
  private boundClear: HTMLButtonElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-date-picker")
    this.render()
  }

  public disconnectedCallback(): void {
    this.unbind()
  }

  public attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (this.initialized && this.isConnected) {
      if (name === "type") {
        this.render()
      } else {
        this.syncInputs()
      }
    }
  }

  public get value(): string | null {
    return this.getAttribute("value")
  }

  public set value(value: string | null) {
    this.setStringAttribute("value", value)
    if (this.initialized) this.syncInputs()
  }

  public get type(): DatePickerType {
    return this.choiceAttribute("type", datePickerTypes, "date")
  }

  public set type(value: DatePickerType) {
    this.setChoiceAttribute("type", value, datePickerTypes)
    if (this.initialized && this.isConnected) this.render()
  }

  public get placeholder(): string | null {
    return this.getAttribute("placeholder")
  }

  public set placeholder(value: string | null) {
    this.setStringAttribute("placeholder", value)
    if (this.initialized) this.syncInputs()
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

  public get format(): string | null {
    return this.getAttribute("format")
  }

  public set format(value: string | null) {
    this.setStringAttribute("format", value)
  }

  public override focus(options?: FocusOptions): void {
    const inputs = this.childInputs()
    inputs[0]?.focus(options)
  }

  public override blur(): void {
    const inputs = this.childInputs()
    inputs[0]?.blur()
  }

  public clear(): void {
    this.value = null
    const inputs = this.childInputs()
    for (const input of inputs) {
      input.value = ""
    }
    this.emit<{ value: string }>("m:change", { value: "" }, { bubbles: true, cancelable: false, composed: false })
  }

  private childInputs(): HTMLInputElement[] {
    return [...this.querySelectorAll<HTMLInputElement>("input")].filter(
      input => input.closest("m-date-picker") === this,
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
      const mode = this.type
      if (mode === "daterange" || mode === "datetimerange") {
        const inputType = mode === "datetimerange" ? "datetime-local" : "date"
        const fields = this.ownerDocument.createElement("div")
        fields.className = "m-date-picker__fields"

        const startInput = this.ownerDocument.createElement("input")
        startInput.type = inputType
        startInput.setAttribute("data-date-control", "")
        startInput.setAttribute("aria-label", "Start date")

        const arrow = this.ownerDocument.createElement("span")
        arrow.setAttribute("aria-hidden", "true")
        arrow.textContent = "→"

        const endInput = this.ownerDocument.createElement("input")
        endInput.type = inputType
        endInput.setAttribute("data-date-control", "")
        endInput.setAttribute("aria-label", "End date")

        fields.append(startInput, arrow, endInput)
        this.append(fields)
      } else {
        const input = this.ownerDocument.createElement("input")
        input.setAttribute("data-date-control", "")
        if (mode === "datetime") input.type = "datetime-local"
        else if (mode === "month") input.type = "month"
        else if (mode === "year") {
          input.type = "number"
          input.placeholder = this.placeholder ?? "YYYY"
        } else if (mode === "quarter") {
          input.type = "text"
          input.placeholder = this.placeholder ?? "YYYY-Q#"
        } else {
          input.type = "date"
        }
        this.append(input)
      }
      inputs = this.childInputs()
    }

    let clearBtn = this.querySelector<HTMLButtonElement>("[data-date-clear]")
    if (this.clearable && !clearBtn) {
      clearBtn = this.ownerDocument.createElement("button")
      clearBtn.type = "button"
      clearBtn.setAttribute("data-date-clear", "")
      clearBtn.setAttribute("aria-label", "Clear date")
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
    const val = this.value

    for (const input of inputs) {
      input.disabled = disabled
      if (placeholder !== null) {
        input.placeholder = placeholder
      }
    }

    let clearBtn = this.querySelector<HTMLButtonElement>("[data-date-clear]")
    if (this.clearable && !clearBtn && this.isConnected) {
      clearBtn = this.ownerDocument.createElement("button")
      clearBtn.type = "button"
      clearBtn.setAttribute("data-date-clear", "")
      clearBtn.setAttribute("aria-label", "Clear date")
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
    const secondInput = inputs[1]
    if (firstInput && inputs.length === 1) {
      firstInput.value = val ?? ""
    } else if (firstInput && secondInput && inputs.length >= 2) {
      if (!val) {
        firstInput.value = ""
        secondInput.value = ""
      } else if (val.includes(",")) {
        const parts = val.split(",")
        firstInput.value = parts[0]?.trim() ?? ""
        secondInput.value = parts[1]?.trim() ?? ""
      } else if (val.includes("/")) {
        const parts = val.split("/")
        firstInput.value = parts[0]?.trim() ?? ""
        secondInput.value = parts[1]?.trim() ?? ""
      } else {
        firstInput.value = val
        secondInput.value = ""
      }
    }
  }

  private onInputChange = (event: Event): void => {
    event.stopPropagation()
    const inputs = this.childInputs()
    let newValue: string | null = null
    const firstInput = inputs[0]
    const secondInput = inputs[1]
    if (firstInput && inputs.length === 1) {
      newValue = firstInput.value || null
    } else if (firstInput && secondInput && inputs.length >= 2) {
      const s = firstInput.value
      const e = secondInput.value
      if (s || e) newValue = `${s},${e}`
    }
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
