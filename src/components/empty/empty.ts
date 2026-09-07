const inert = "template,script,style"

function illustration(document: Document): SVGSVGElement {
  const namespace = "http://www.w3.org/2000/svg"
  const svg = document.createElementNS(namespace, "svg")
  svg.setAttribute("viewBox", "0 0 48 48")
  svg.setAttribute("aria-hidden", "true")
  svg.setAttribute("focusable", "false")
  svg.setAttribute("fill", "none")
  svg.setAttribute("stroke", "currentColor")
  svg.setAttribute("stroke-width", "2")
  svg.setAttribute("stroke-linejoin", "round")
  for (const d of ["M8 20l7-10h18l7 10v18H8Z", "M8 22h9l3 5h8l3-5h9"]) {
    const path = document.createElementNS(namespace, "path")
    path.setAttribute("d", d)
    svg.append(path)
  }
  return svg
}

export class MuiEmpty extends HTMLElement {
  public static get observedAttributes(): string[] { return ["description", "show-icon", "icon"] }

  private generatedDescription: HTMLElement | undefined
  private fallbackText: Text | undefined
  private generatedIcon: HTMLSpanElement | undefined
  private renderedGlyph: string | null | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["description", "showDescription", "showIcon", "size", "icon"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiEmpty = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void { this.observer?.disconnect() }
  public attributeChangedCallback(): void { if (this.isConnected) this.synchronize() }
  public get description(): string { return this.getAttribute("description") ?? "No Data" }
  public set description(value: string | null | undefined) {
    if (value == null) this.removeAttribute("description")
    else this.setAttribute("description", value)
  }
  public get showDescription(): boolean { return this.getAttribute("show-description") !== "false" }
  public set showDescription(value: boolean) { this.setAttribute("show-description", String(value)) }
  public get showIcon(): boolean { return this.getAttribute("show-icon") !== "false" }
  public set showIcon(value: boolean) { this.setAttribute("show-icon", String(value)) }
  public get size(): string { return this.getAttribute("size") ?? "medium" }
  public set size(value: string) { this.setAttribute("size", value) }
  public get icon(): string { return this.getAttribute("icon") ?? "" }
  public set icon(value: string | null | undefined) {
    if (value == null) this.removeAttribute("icon")
    else this.setAttribute("icon", value)
  }

  private region(name: string, except?: Element): Element | undefined {
    return [...this.children].find((node) =>
      node !== except && node.hasAttribute(`data-mui-empty-${name}`) && !node.matches(inert))
  }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.generatedDescription?.parentNode !== this) {
      this.generatedDescription = undefined
      this.fallbackText = undefined
    }
    if (this.fallbackText?.parentNode !== this.generatedDescription) this.fallbackText = undefined
    if (this.generatedIcon?.parentNode !== this) {
      this.generatedIcon = undefined
      this.renderedGlyph = undefined
    }

    let icon = this.region("icon", this.generatedIcon)
    if (icon) {
      this.generatedIcon?.remove()
      this.generatedIcon = undefined
      this.renderedGlyph = undefined
    } else if (this.showIcon || this.generatedIcon) {
      if (!this.generatedIcon) {
        this.generatedIcon = this.ownerDocument.createElement("span")
        this.generatedIcon.dataset.muiEmptyIcon = ""
        this.generatedIcon.setAttribute("aria-hidden", "true")
        this.prepend(this.generatedIcon)
      }
      const glyph = this.getAttribute("icon")
      if (glyph !== this.renderedGlyph) {
        this.generatedIcon.replaceChildren(glyph === null ? illustration(this.ownerDocument) : this.ownerDocument.createTextNode(glyph))
        this.renderedGlyph = glyph
      }
      icon = this.generatedIcon
    }

    let description = this.region("description", this.generatedDescription) ?? this.generatedDescription
    if (description && this.generatedDescription && description !== this.generatedDescription) {
      this.fallbackText?.remove()
      this.fallbackText = undefined
      description.prepend(...this.generatedDescription.childNodes)
      this.generatedDescription.remove()
      this.generatedDescription = undefined
    }
    const extra = this.region("extra")
    const loose = [...this.childNodes].filter((node) => {
      if (node === icon || node === description || node === extra) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches(inert)
    })
    if (!description) {
      this.generatedDescription = this.ownerDocument.createElement("div")
      this.generatedDescription.dataset.muiEmptyDescription = ""
      description = this.generatedDescription
      this.insertBefore(description, extra ?? null)
    }
    if (loose.length) {
      this.fallbackText?.remove()
      this.fallbackText = undefined
      description.append(...loose)
    }
    const authored = description !== this.generatedDescription || [...description.childNodes].some((node) => node !== this.fallbackText)
    if (authored) {
      this.fallbackText?.remove()
      this.fallbackText = undefined
    } else if (!this.fallbackText) {
      this.fallbackText = this.ownerDocument.createTextNode(this.description)
      description.append(this.fallbackText)
    } else if (this.fallbackText.data !== this.description) {
      this.fallbackText.data = this.description
    }

    if (extra && description.compareDocumentPosition(extra) & Node.DOCUMENT_POSITION_PRECEDING) this.insertBefore(description, extra)
    if (icon && icon.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_PRECEDING) this.insertBefore(icon, description)
    if (this.isConnected) this.observer?.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["data-mui-empty-description", "data-mui-empty-icon", "data-mui-empty-extra"],
    })
  }
}
