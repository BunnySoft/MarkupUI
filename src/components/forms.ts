import { MuiElement } from "../core/element.js"

export class MuiInput extends MuiElement {
  private control?: HTMLInputElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    this.control = this.ownerDocument.createElement("input")
    for (const name of ["name", "placeholder", "type", "value", "aria-label"]) {
      const value = this.getAttribute(name)
      if (value !== null) this.control.setAttribute(name, value)
    }
    this.control.addEventListener("input", () => this.emit("input", this.control?.value))
    this.control.addEventListener("change", () => this.emit("change", this.control?.value))
    this.replaceChildren(this.control)
  }
  public get value(): string { return this.control?.value ?? "" }
  public set value(value: string) { if (this.control !== undefined) this.control.value = value }
}

export class MuiTextarea extends MuiElement {
  private control?: HTMLTextAreaElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    this.control = this.ownerDocument.createElement("textarea")
    this.control.placeholder = this.getAttribute("placeholder") ?? ""
    this.control.value = this.getAttribute("value") ?? ""
    this.control.addEventListener("input", () => this.emit("input", this.control?.value))
    this.control.addEventListener("change", () => this.emit("change", this.control?.value))
    this.replaceChildren(this.control)
  }
  public get value(): string { return this.control?.value ?? "" }
  public set value(value: string) { if (this.control !== undefined) this.control.value = value }
}

export class MuiSelect extends MuiElement {
  private control?: HTMLSelectElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    const options = [...this.querySelectorAll(":scope > option,:scope > mui-option")].map((source) => {
      if (source instanceof HTMLOptionElement) return source.cloneNode(true)
      const option = this.ownerDocument.createElement("option")
      option.textContent = source.textContent
      for (const name of ["value", "label"]) {
        const value = source.getAttribute(name)
        if (value !== null) option.setAttribute(name, value)
      }
      option.disabled = source.hasAttribute("disabled")
      option.selected = source.hasAttribute("selected")
      return option
    })
    this.control = this.ownerDocument.createElement("select")
    this.control.replaceChildren(...options)
    this.control.value = this.getAttribute("value") ?? ""
    this.control.addEventListener("change", () => this.emit("change", this.control?.value))
    this.replaceChildren(this.control)
  }
  public get value(): string { return this.control?.value ?? "" }
  public set value(value: string) { if (this.control !== undefined) this.control.value = value }
}

export class MuiAutocomplete extends MuiElement {
  private control?: HTMLInputElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    const options = [...this.querySelectorAll(":scope > mui-option")]
    const list = this.ownerDocument.createElement("datalist")
    list.id = `mui-autocomplete-${Math.random().toString(36).slice(2)}`
    options.forEach((source) => {
      const option = this.ownerDocument.createElement("option")
      option.value = source.getAttribute("value") ?? source.textContent?.trim() ?? ""
      option.label = source.getAttribute("label") ?? source.textContent?.trim() ?? ""
      list.append(option)
    })
    this.control = this.ownerDocument.createElement("input")
    this.control.setAttribute("list", list.id)
    for (const name of ["name", "placeholder", "value", "aria-label"]) {
      const value = this.getAttribute(name)
      if (value !== null) this.control.setAttribute(name, value)
    }
    this.control.addEventListener("input", () => this.emit("input", this.control?.value))
    this.control.addEventListener("change", () => this.emit("change", this.control?.value))
    this.replaceChildren(this.control, list)
  }
  public get value(): string { return this.control?.value ?? "" }
  public set value(value: string) { if (this.control !== undefined) this.control.value = value }
}

export class MuiSlider extends MuiElement {
  private control?: HTMLInputElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    this.control = this.ownerDocument.createElement("input")
    this.control.type = "range"
    for (const name of ["name", "min", "max", "step", "value", "aria-label"]) {
      const value = this.getAttribute(name)
      if (value !== null) this.control.setAttribute(name, value)
    }
    this.control.addEventListener("input", () => this.emit("input", this.control?.valueAsNumber))
    this.control.addEventListener("change", () => this.emit("change", this.control?.valueAsNumber))
    this.replaceChildren(this.control)
  }
  public get value(): number { return this.control?.valueAsNumber ?? 0 }
  public set value(value: number) { if (this.control !== undefined) this.control.valueAsNumber = Number(value) }
}

export class MuiCheckbox extends MuiElement {
  private control?: HTMLInputElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    const label = this.textContent ?? ""
    this.control = this.ownerDocument.createElement("input")
    this.control.type = "checkbox"
    this.control.checked = this.hasAttribute("checked")
    const text = this.ownerDocument.createElement("span")
    text.textContent = label
    this.control.addEventListener("change", () => this.emit("change", this.control?.checked))
    this.replaceChildren(this.control, text)
  }
  public get checked(): boolean { return this.control?.checked ?? false }
  public set checked(value: boolean) { if (this.control !== undefined) this.control.checked = value }
}

export class MuiRadio extends MuiElement {
  private control?: HTMLInputElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    const label = this.textContent ?? ""
    this.control = this.ownerDocument.createElement("input")
    this.control.type = "radio"
    this.control.value = this.getAttribute("value") ?? ""
    this.control.checked = this.hasAttribute("checked")
    const text = this.ownerDocument.createElement("span")
    text.textContent = label
    this.control.addEventListener("change", () => this.emit("change", this.control?.checked))
    this.replaceChildren(this.control, text)
  }
  public get value(): string { return this.getAttribute("value") ?? "" }
  public get checked(): boolean { return this.control?.checked ?? false }
  public set checked(value: boolean) { if (this.control !== undefined) this.control.checked = value }
}

export class MuiRadioGroup extends MuiElement {
  private readonly onChange = (event: Event): void => {
    if (!(event.target instanceof MuiRadio) || !(event as CustomEvent).detail) return
    this.value = event.target.value
    this.emit("change", this.value)
  }
  public connectedCallback(): void {
    this.setAttribute("role", "radiogroup")
    this.addEventListener("mui:change", this.onChange)
    queueMicrotask(() => {
      const value = this.getAttribute("value")
      if (this.isConnected && value !== null) this.value = value
    })
  }
  public disconnectedCallback(): void {
    this.removeEventListener("mui:change", this.onChange)
  }
  public get value(): string {
    return [...this.querySelectorAll<MuiRadio>(":scope > mui-radio")]
      .find((radio) => radio.checked)?.value ?? ""
  }
  public set value(value: string) {
    this.querySelectorAll<MuiRadio>(":scope > mui-radio").forEach((radio) => {
      radio.checked = radio.value === value
    })
  }
}

export class MuiSwitch extends MuiCheckbox {
  public override connectedCallback(): void {
    super.connectedCallback()
    this.setAttribute("role", "switch")
  }
}

export class MuiFormItem extends MuiElement {
  private error: HTMLElement | undefined
  public connectedCallback(): void {
    const labelText = this.getAttribute("label")
    if (this.querySelector(":scope > [data-mui-label]") === null) {
      if (labelText) {
        const label = this.ownerDocument.createElement("span")
        label.dataset.muiLabel = ""
        label.textContent = labelText
        this.prepend(label)
      }
    }
    this.error = this.querySelector<HTMLElement>(":scope > [data-mui-error]") ?? undefined
    if (this.error === undefined) {
      this.error = this.ownerDocument.createElement("span")
      this.error.dataset.muiError = ""
      this.error.hidden = true
      this.append(this.error)
    }
    const control = this.querySelector<HTMLElement>(
      "mui-input,mui-textarea,mui-select,mui-autocomplete,mui-slider,mui-radio-group,mui-checkbox,mui-switch",
    )
    if (control !== null && labelText && !control.hasAttribute("aria-label")) {
      control.setAttribute("aria-label", labelText)
    }
    if (control !== null && this.error !== undefined) {
      this.error.id ||= `mui-error-${Math.random().toString(36).slice(2)}`
      control.setAttribute("aria-describedby", this.error.id)
    }
  }
  public validate(): boolean {
    const control = this.querySelector<HTMLElement>(
      "mui-input,mui-textarea,mui-select,mui-autocomplete,mui-slider,mui-radio-group,mui-checkbox,mui-switch",
    )
    if (control === null) return true
    const property = control.matches("mui-checkbox,mui-switch") ? "checked" : "value"
    const value = Reflect.get(control, property) as unknown
    const text = value === null || value === undefined ? "" : String(value)
    let message = ""
    if (this.hasAttribute("required") && (value === false || text.trim() === "")) {
      message = this.getAttribute("required-message") ?? "This field is required."
    }
    const minLength = Number(this.getAttribute("minlength"))
    if (!message && Number.isFinite(minLength) && text.length < minLength) {
      message = this.getAttribute("minlength-message") ?? `Enter at least ${minLength} characters.`
    }
    const pattern = this.getAttribute("pattern")
    if (!message && pattern && !new RegExp(pattern).test(text)) {
      message = this.getAttribute("pattern-message") ?? "The value has an invalid format."
    }
    const invalid = message !== ""
    this.toggleAttribute("invalid", invalid)
    control.setAttribute("aria-invalid", String(invalid))
    if (this.error !== undefined) {
      this.error.textContent = message
      this.error.hidden = !invalid
    }
    return !invalid
  }
}

export class MuiForm extends MuiElement {
  public connectedCallback(): void {
    this.setAttribute("role", "form")
  }
  public validate(): boolean {
    const valid = [...this.querySelectorAll<MuiFormItem>("mui-form-item")]
      .map((item) => item.validate())
      .every(Boolean)
    this.emit(valid ? "valid" : "invalid")
    return valid
  }
}
