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

export class MSkeleton extends MElement {
  public connectedCallback(): void {
    this.setAttribute("aria-hidden", "true")
    const width = this.getAttribute("width")
    const height = this.getAttribute("height")
    if (width) this.style.width = width
    if (height) this.style.height = height
  }
}

export class MEmpty extends MElement {
  public connectedCallback(): void {
    if (this.childElementCount > 0) return
    const icon = this.ownerDocument.createElement("span")
    icon.dataset.mEmptyIcon = ""
    icon.setAttribute("aria-hidden", "true")
    icon.textContent = this.getAttribute("icon") ?? "◇"
    const text = this.ownerDocument.createElement("span")
    text.textContent = this.getAttribute("description") ?? "No data"
    this.append(icon, text)
  }
}
