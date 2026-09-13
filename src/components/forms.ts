import { MElement } from "../core/element.js"

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
