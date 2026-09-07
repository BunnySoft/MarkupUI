const regions = ["cover", "header", "header-extra", "content", "footer", "action"] as const
const selector = (name: string): string => `mui-card-${name},[data-mui-card-${name}]`
const regionSelector = regions.map(selector).join(",")

export interface CardCloseDetail {
  originalEvent: MouseEvent
}

export class MuiCard extends HTMLElement {
  public static get observedAttributes(): string[] { return ["title", "closable", "close-label", "close-focusable"] }

  private generatedHeader: HTMLElement | undefined
  private generatedContent: HTMLElement | undefined
  private generatedTitle: HTMLSpanElement | undefined
  private closeButton: HTMLButtonElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["title", "size", "bordered", "closable", "closeFocusable", "closeLabel", "hoverable", "embedded", "segmented", "contentScrollable"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiCard = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.closeButton?.removeEventListener("click", this.onClose)
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public get size(): string { return this.getAttribute("size") ?? "medium" }
  public set size(value: string) { this.setAttribute("size", value) }
  public get bordered(): boolean { return this.getAttribute("bordered") !== "false" }
  public set bordered(value: boolean) { this.setAttribute("bordered", String(value)) }
  public get closable(): boolean { return this.hasAttribute("closable") }
  public set closable(value: boolean) { this.toggleAttribute("closable", value) }
  public get closeFocusable(): boolean { return this.getAttribute("close-focusable") !== "false" }
  public set closeFocusable(value: boolean) { this.setAttribute("close-focusable", String(value)) }
  public get closeLabel(): string { return this.getAttribute("close-label")?.trim() || "Close card" }
  public set closeLabel(value: string) { this.setAttribute("close-label", value) }
  public get hoverable(): boolean { return this.hasAttribute("hoverable") }
  public set hoverable(value: boolean) { this.toggleAttribute("hoverable", value) }
  public get embedded(): boolean { return this.hasAttribute("embedded") }
  public set embedded(value: boolean) { this.toggleAttribute("embedded", value) }
  public get segmented(): boolean { return this.hasAttribute("segmented") }
  public set segmented(value: boolean) { this.toggleAttribute("segmented", value) }
  public get contentScrollable(): boolean { return this.hasAttribute("content-scrollable") }
  public set contentScrollable(value: boolean) { this.toggleAttribute("content-scrollable", value) }

  private region(name: string, except?: HTMLElement): HTMLElement | undefined {
    return [...this.children].find((element): element is HTMLElement =>
      element instanceof HTMLElement && element !== except && element.matches(selector(name)))
  }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.generatedHeader?.parentNode !== this) this.generatedHeader = undefined
    if (this.generatedContent?.parentNode !== this) this.generatedContent = undefined

    let header = this.region("header", this.generatedHeader) ?? this.generatedHeader
    const extra = this.region("header-extra")
    if (!header && (this.title || this.closable || extra)) {
      header = this.ownerDocument.createElement("div")
      header.dataset.muiCardHeader = ""
      this.generatedHeader = header
      const cover = this.region("cover")
      if (cover) cover.after(header)
      else this.prepend(header)
    }
    if (header && this.generatedHeader && header !== this.generatedHeader) {
      this.generatedTitle?.remove()
      header.append(...this.generatedHeader.childNodes)
      this.generatedHeader.remove()
      this.generatedHeader = undefined
    }
    if (header && header === this.generatedHeader && this.title) {
      if (!this.generatedTitle) {
        this.generatedTitle = this.ownerDocument.createElement("span")
        this.generatedTitle.dataset.muiCardTitle = ""
      }
      if (this.generatedTitle.textContent !== this.title) this.generatedTitle.textContent = this.title
      if (this.generatedTitle.parentNode !== header) header.prepend(this.generatedTitle)
    } else {
      this.generatedTitle?.remove()
      this.generatedTitle = undefined
    }
    if (header && extra) {
      header.insertBefore(extra, this.closeButton?.parentNode === header ? this.closeButton : null)
    }
    if (this.closable && header) {
      if (!this.closeButton) {
        this.closeButton = this.ownerDocument.createElement("button")
        this.closeButton.type = "button"
        this.closeButton.dataset.muiCardClose = ""
        const icon = this.ownerDocument.createElement("span")
        icon.setAttribute("aria-hidden", "true")
        icon.textContent = "×"
        this.closeButton.append(icon)
      }
      this.closeButton.setAttribute("aria-label", this.closeLabel)
      this.closeButton.tabIndex = this.closeFocusable ? 0 : -1
      if (header.lastChild !== this.closeButton) header.append(this.closeButton)
      this.closeButton.addEventListener("click", this.onClose)
    } else {
      this.closeButton?.removeEventListener("click", this.onClose)
      this.closeButton?.remove()
      this.closeButton = undefined
    }
    if (this.generatedHeader && ![...this.generatedHeader.childNodes].some((node) =>
      node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim()))) {
      this.generatedHeader.remove()
      this.generatedHeader = undefined
    }

    let content = this.region("content", this.generatedContent) ?? this.generatedContent
    if (content && this.generatedContent && content !== this.generatedContent) {
      content.prepend(...this.generatedContent.childNodes)
      this.generatedContent.remove()
      this.generatedContent = undefined
    }
    const loose = [...this.childNodes].filter((node) =>
      node.nodeType === Node.TEXT_NODE ? Boolean(node.textContent?.trim())
        : node instanceof Element && !node.matches(`${regionSelector},template,script,style`))
    if (loose.length) {
      if (!content) {
        content = this.ownerDocument.createElement("div")
        content.dataset.muiCardContent = ""
        this.generatedContent = content
        this.insertBefore(content, this.region("footer") ?? this.region("action") ?? null)
      }
      content.append(...loose)
    }
    if (this.generatedContent && !this.generatedContent.hasChildNodes()) {
      this.generatedContent.remove()
      this.generatedContent = undefined
    }
    this.toggleAttribute("structured", [...this.children].some((element) => element.matches(regionSelector)))
    if (this.isConnected) {
      this.observer?.observe(this, {
        childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: regions.map((name) => `data-mui-card-${name}`),
      })
    }
  }

  private readonly onClose = (event: MouseEvent): void => {
    if (!this.closable || !this.isConnected || this.closeButton?.matches(":disabled")) return
    this.dispatchEvent(new CustomEvent<CardCloseDetail>("mui:close", {
      bubbles: true,
      cancelable: true,
      detail: { originalEvent: event },
    }))
  }
}
