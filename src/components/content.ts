import { MElement } from "../core/element.js"

export class MLayout extends MElement {
  public connectedCallback(): void {
    const basis = this.getAttribute("basis")
    const overflow = this.getAttribute("overflow")
    if (basis !== null) this.style.flexBasis = basis
    if (overflow !== null) this.style.overflow = overflow
  }
}

export class MButton extends MElement {
  public static get observedAttributes(): string[] { return ["disabled", "loading"] }
  public connectedCallback(): void {
    this.setAttribute("role", "button")
    this.syncDisabled()
    this.addEventListener("keydown", this.onKeyDown)
    this.addEventListener("click", this.onClick)
  }
  public attributeChangedCallback(): void {
    if (this.isConnected) this.syncDisabled()
  }
  public disconnectedCallback(): void {
    this.removeEventListener("keydown", this.onKeyDown)
    this.removeEventListener("click", this.onClick)
  }
  private readonly onClick = (event: Event): void => {
    if (this.hasAttribute("disabled") || this.hasAttribute("loading")) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      this.click()
    }
  }
  private syncDisabled(): void {
    const loading = this.hasAttribute("loading")
    const disabled = this.hasAttribute("disabled") || loading
    this.tabIndex = disabled ? -1 : 0
    this.setAttribute("aria-disabled", String(disabled))
    this.setAttribute("aria-busy", String(loading))
    const spinner = this.querySelector(":scope > [data-m-button-spinner]")
    if (loading && spinner === null) {
      const element = this.ownerDocument.createElement("span")
      element.dataset.mButtonSpinner = ""
      element.setAttribute("aria-hidden", "true")
      this.prepend(element)
    } else if (!loading) {
      spinner?.remove()
    }
  }
}

export class MCard extends MLayout {
  public override connectedCallback(): void {
    super.connectedCallback()
    this.toggleAttribute(
      "structured",
      this.querySelector(":scope > m-card-header,:scope > m-card-content,:scope > m-card-footer") !== null,
    )
  }
}

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

export class MAvatar extends MElement {
  public connectedCallback(): void {
    if (this.querySelector(":scope > img") !== null) return
    const src = this.getAttribute("src")
    const alt = this.getAttribute("alt") ?? this.textContent?.trim() ?? ""
    this.setAttribute("role", "img")
    this.setAttribute("aria-label", alt)
    if (!src) return
    const image = this.ownerDocument.createElement("img")
    image.src = src
    image.alt = alt
    this.replaceChildren(image)
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

export class MTag extends MElement {
  public connectedCallback(): void {
    if (!this.hasAttribute("closable") || this.querySelector(":scope > [data-m-close]") !== null) return
    const button = this.ownerDocument.createElement("button")
    button.type = "button"
    button.dataset.mClose = ""
    button.setAttribute("aria-label", this.getAttribute("close-label") ?? "Remove")
    button.textContent = "×"
    button.addEventListener("click", (event) => {
      event.stopPropagation()
      this.emit("close")
    })
    this.append(button)
  }
}
