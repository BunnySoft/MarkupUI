import { MElement } from "../core/element.js"

export class MSelect extends MElement {
  private control?: HTMLSelectElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    const options = [...this.querySelectorAll(":scope > option,:scope > m-option")].map((source) => {
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

export class MAutocomplete extends MElement {
  private control?: HTMLInputElement
  public connectedCallback(): void {
    if (this.control !== undefined) return
    const options = [...this.querySelectorAll(":scope > m-option")]
    const list = this.ownerDocument.createElement("datalist")
    list.id = `m-autocomplete-${Math.random().toString(36).slice(2)}`
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

export class MSlider extends MElement {
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

export class MFormItem extends MElement {
  private error: HTMLElement | undefined
  public connectedCallback(): void {
    const labelText = this.getAttribute("label")
    if (this.querySelector(":scope > [data-m-label]") === null) {
      if (labelText) {
        const label = this.ownerDocument.createElement("span")
        label.dataset.mLabel = ""
        label.textContent = labelText
        this.prepend(label)
      }
    }
    this.error = this.querySelector<HTMLElement>(":scope > [data-m-error]") ?? undefined
    if (this.error === undefined) {
      this.error = this.ownerDocument.createElement("span")
      this.error.dataset.mError = ""
      this.error.hidden = true
      this.append(this.error)
    }
    const control = this.querySelector<HTMLElement>(
      "m-input,m-textarea,m-select,m-autocomplete,m-slider,m-radio-group,m-checkbox,m-switch",
    )
    if (control !== null && labelText && !control.hasAttribute("aria-label")) {
      control.setAttribute("aria-label", labelText)
    }
    if (control !== null && this.error !== undefined) {
      this.error.id ||= `m-error-${Math.random().toString(36).slice(2)}`
      control.setAttribute("aria-describedby", this.error.id)
    }
  }
  public validate(): boolean {
    const control = this.querySelector<HTMLElement>(
      "m-input,m-textarea,m-select,m-autocomplete,m-slider,m-radio-group,m-checkbox,m-switch",
    )
    if (control === null) return true
    const property = control.matches("m-checkbox,m-switch") ? "checked" : "value"
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

export class MForm extends MElement {
  public connectedCallback(): void {
    this.setAttribute("role", "form")
  }
  public validate(): boolean {
    const valid = [...this.querySelectorAll<MFormItem>("m-form-item")]
      .map((item) => item.validate())
      .every(Boolean)
    this.emit(valid ? "valid" : "invalid")
    return valid
  }
}
