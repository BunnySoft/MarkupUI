function numeric(value: string | null): number | undefined {
  if (value === null || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return undefined
  const result = Number(value)
  return Number.isFinite(result) ? result : undefined
}

export class MuiBadge extends HTMLElement {
  public static get observedAttributes(): string[] { return ["value", "max", "dot", "show", "show-zero", "decorative"] }

  private badge: HTMLSpanElement | undefined
  private numberContent: HTMLSpanElement | undefined
  private customContent: HTMLSpanElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["value", "max", "dot", "show", "showZero", "processing", "type", "placement", "decorative"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiBadge = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void { this.observer?.disconnect() }
  public attributeChangedCallback(): void { if (this.isConnected) this.synchronize() }

  public get indicator(): HTMLSpanElement | null { return this.badge ?? null }
  public get value(): string | undefined { return this.getAttribute("value") ?? undefined }
  public set value(value: string | number | null | undefined) {
    if (value == null || (typeof value === "number" && !Number.isFinite(value))) this.removeAttribute("value")
    else this.setAttribute("value", String(value))
  }
  public get max(): number | undefined {
    const max = numeric(this.getAttribute("max"))
    return max !== undefined && max >= 0 ? max : undefined
  }
  public set max(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value) || value < 0) this.removeAttribute("max")
    else this.setAttribute("max", String(value))
  }
  public get dot(): boolean { return this.hasAttribute("dot") }
  public set dot(value: boolean) { this.toggleAttribute("dot", value) }
  public get show(): boolean { return this.getAttribute("show") !== "false" }
  public set show(value: boolean) { this.setAttribute("show", String(value)) }
  public get showZero(): boolean { return this.hasAttribute("show-zero") }
  public set showZero(value: boolean) { this.toggleAttribute("show-zero", value) }
  public get processing(): boolean { return this.hasAttribute("processing") }
  public set processing(value: boolean) { this.toggleAttribute("processing", value) }
  public get type(): string { return this.getAttribute("type") ?? "default" }
  public set type(value: string) { this.setAttribute("type", value) }
  public get placement(): string { return this.getAttribute("placement") ?? "top-end" }
  public set placement(value: string) { this.setAttribute("placement", value) }
  public get decorative(): boolean { return this.hasAttribute("decorative") }
  public set decorative(value: boolean) { this.toggleAttribute("decorative", value) }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.badge?.parentNode !== this) {
      this.badge = this.ownerDocument.createElement("span")
      this.badge.dataset.muiBadgeIndicator = ""
      this.numberContent = this.ownerDocument.createElement("span")
      this.numberContent.dataset.muiBadgeNumber = ""
      this.customContent = this.ownerDocument.createElement("span")
      this.customContent.dataset.muiBadgeCustom = ""
      this.badge.append(this.numberContent, this.customContent)
      this.append(this.badge)
    }
    const badge = this.badge
    const number = this.numberContent!
    const custom = this.customContent!
    for (const element of [...custom.children]) {
      if (!element.hasAttribute("data-mui-badge-value")) this.insertBefore(element, badge)
    }
    for (const element of [...this.children]) {
      if (element !== badge && element.hasAttribute("data-mui-badge-value") && !element.matches("template,script,style")) custom.append(element)
    }
    const attached = [...this.childNodes].some((node) => {
      if (node === badge) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches("template,script,style")
    })
    this.dataset.muiBadgeMode = attached ? "attached" : "standalone"

    const value = this.value
    const count = numeric(value ?? null)
    const max = this.max
    const text = count !== undefined && max !== undefined && count > max ? `${max}+` : value ?? ""
    const useDigitCells = count !== undefined && /^\d+\+?$/.test(text)
    if (number.textContent !== text || useDigitCells !== (number.childElementCount > 0)) {
      if (useDigitCells) {
        number.replaceChildren(...[...text].map((character) => {
          const digit = this.ownerDocument.createElement("span")
          digit.dataset.muiBadgeDigit = ""
          digit.textContent = character
          return digit
        }))
      } else number.textContent = text
    }
    const authoredValue = custom.hasChildNodes()
    number.hidden = this.dot || authoredValue
    custom.hidden = this.dot
    const hasValue = value !== undefined && Boolean(value.trim())
      && (count === undefined || count > 0 || this.showZero)
    badge.hidden = !this.show || !(this.dot || authoredValue || hasValue)
    this.dataset.muiBadgeState = badge.hidden ? "hidden" : this.dot ? "dot" : "value"
    if (this.decorative) badge.setAttribute("aria-hidden", "true")
    else badge.removeAttribute("aria-hidden")

    if (this.isConnected) this.observer?.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["data-mui-badge-value"],
    })
  }
}
