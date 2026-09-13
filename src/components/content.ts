import { MElement } from "../core/element.js"

export class MProgress extends MElement {
  public static get observedAttributes(): string[] { return ["value", "max"] }
  private bar?: HTMLElement

  public connectedCallback(): void {
    if (this.bar === undefined) {
      this.bar = this.ownerDocument.createElement("span")
      this.bar.dataset.mBar = ""
      this.replaceChildren(this.bar)
    }
    this.update()
  }
  public attributeChangedCallback(): void {
    if (this.isConnected) this.update()
  }

  private update(): void {
    const max = Math.max(0, this.numberAttribute("max", 100))
    const value = Math.max(0, Math.min(this.numberAttribute("value", 0), max))
    const percent = max === 0 ? 0 : (value / max) * 100
    this.setAttribute("role", "progressbar")
    this.setAttribute("aria-valuemin", "0")
    this.setAttribute("aria-valuemax", String(max))
    this.setAttribute("aria-valuenow", String(value))
    if (this.bar !== undefined) this.bar.style.width = `${percent}%`
  }
}
