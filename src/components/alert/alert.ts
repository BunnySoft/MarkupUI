const icons: Readonly<Record<string, string>> = { info: "ⓘ", success: "✓", warning: "!", error: "×" }
const inert = "template,script,style"

export interface AlertCloseDetail { originalEvent: MouseEvent }

export class MuiAlert extends HTMLElement {
  public static get observedAttributes(): string[] { return ["title", "type", "show-icon", "closable", "close-label"] }

  private body: HTMLElement | undefined
  private generatedBody: HTMLElement | undefined
  private generatedHeader: HTMLSpanElement | undefined
  private generatedContent: HTMLElement | undefined
  private generatedIcon: HTMLSpanElement | undefined
  private closeButton: HTMLButtonElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["title", "type", "showIcon", "bordered", "closable", "closeLabel"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiAlert = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.closeButton?.removeEventListener("click", this.onClose)
  }

  public attributeChangedCallback(): void { if (this.isConnected) this.synchronize() }
  public get type(): string { return this.getAttribute("type") ?? "default" }
  public set type(value: string) { this.setAttribute("type", value) }
  public get showIcon(): boolean { return this.getAttribute("show-icon") !== "false" }
  public set showIcon(value: boolean) { this.setAttribute("show-icon", String(value)) }
  public get bordered(): boolean { return this.getAttribute("bordered") !== "false" }
  public set bordered(value: boolean) { this.setAttribute("bordered", String(value)) }
  public get closable(): boolean { return this.hasAttribute("closable") }
  public set closable(value: boolean) { this.toggleAttribute("closable", value) }
  public get closeLabel(): string { return this.getAttribute("close-label")?.trim() || "Close alert" }
  public set closeLabel(value: string) { this.setAttribute("close-label", value) }

  private direct(parent: Element, name: string, except?: Element): Element | undefined {
    return [...parent.children].find((node) =>
      node !== except && node.hasAttribute(`data-mui-alert-${name}`) && !node.matches(inert))
  }

  private region(name: string, except?: Element): Element | undefined {
    return this.direct(this, name, except) ?? (this.body ? this.direct(this.body, name, except) : undefined)
  }

  private synchronize(): void {
    this.observer?.disconnect()
    const bodyCandidate = this.direct(this, "body", this.generatedBody)
    const authoredBody = bodyCandidate instanceof HTMLElement ? bodyCandidate : undefined
    if (authoredBody && authoredBody !== this.body) {
      if (this.generatedBody?.parentNode === this) {
        authoredBody.prepend(...this.generatedBody.childNodes)
        this.generatedBody.remove()
      }
      this.generatedBody = undefined
      this.body = authoredBody
    }
    if (this.body?.parentNode !== this) {
      this.body = this.ownerDocument.createElement("div")
      this.body.dataset.muiAlertBody = ""
      this.generatedBody = this.body
      this.append(this.body)
    }
    const body = this.body
    if (this.generatedHeader?.parentNode !== body) this.generatedHeader = undefined
    if (this.generatedContent?.parentNode !== body) this.generatedContent = undefined

    let icon = this.region("icon", this.generatedIcon)
    if (icon) {
      this.generatedIcon?.remove()
      this.generatedIcon = undefined
      if (icon.parentNode !== this) this.insertBefore(icon, body)
    } else if (this.showIcon && Object.hasOwn(icons, this.type)) {
      if (!this.generatedIcon) {
        this.generatedIcon = this.ownerDocument.createElement("span")
        this.generatedIcon.dataset.muiAlertIcon = ""
        this.generatedIcon.setAttribute("aria-hidden", "true")
      }
      icon = this.generatedIcon
      if (icon.textContent !== icons[this.type]) icon.textContent = icons[this.type]!
      if (icon.parentNode !== this) this.insertBefore(icon, body)
    } else {
      this.generatedIcon?.remove()
      this.generatedIcon = undefined
    }

    let header = this.region("header", this.generatedHeader)
    if (header) {
      this.generatedHeader?.remove()
      this.generatedHeader = undefined
      if (header.parentNode !== body) body.prepend(header)
    } else if (this.title) {
      if (!this.generatedHeader) {
        this.generatedHeader = this.ownerDocument.createElement("span")
        this.generatedHeader.dataset.muiAlertHeader = ""
        body.prepend(this.generatedHeader)
      }
      header = this.generatedHeader
      if (header.textContent !== this.title) header.textContent = this.title
    } else {
      this.generatedHeader?.remove()
      this.generatedHeader = undefined
    }

    let content = this.region("content", this.generatedContent) ?? this.generatedContent
    if (content && this.generatedContent && content !== this.generatedContent) {
      content.prepend(...this.generatedContent.childNodes)
      this.generatedContent.remove()
      this.generatedContent = undefined
    }
    if (content && content.parentNode !== body) body.append(content)
    const loose = [this, body].flatMap((parent) => [...parent.childNodes].filter((node) => {
      if (node === body || node === icon || node === header || node === content || node === this.closeButton) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches(inert)
    }))
    if (loose.length) {
      if (!content) {
        this.generatedContent = this.ownerDocument.createElement("div")
        this.generatedContent.dataset.muiAlertContent = ""
        content = this.generatedContent
        body.append(content)
      }
      content.append(...loose)
    }
    if (this.generatedContent && !this.generatedContent.hasChildNodes()) {
      this.generatedContent.remove()
      this.generatedContent = undefined
    }

    if (this.closable) {
      if (!this.closeButton) {
        this.closeButton = this.ownerDocument.createElement("button")
        this.closeButton.type = "button"
        this.closeButton.dataset.muiAlertClose = ""
        const glyph = this.ownerDocument.createElement("span")
        glyph.setAttribute("aria-hidden", "true")
        glyph.textContent = "×"
        this.closeButton.append(glyph)
      }
      if (this.closeButton.getAttribute("aria-label") !== this.closeLabel) this.closeButton.setAttribute("aria-label", this.closeLabel)
      if (this.lastElementChild !== this.closeButton) this.append(this.closeButton)
      this.closeButton.addEventListener("click", this.onClose)
    } else {
      this.closeButton?.removeEventListener("click", this.onClose)
      this.closeButton?.remove()
      this.closeButton = undefined
    }
    if (this.isConnected) this.observer?.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["data-mui-alert-body", "data-mui-alert-header", "data-mui-alert-content", "data-mui-alert-icon"],
    })
  }

  private readonly onClose = (event: MouseEvent): void => {
    if (!this.closable || !this.isConnected || event.defaultPrevented || this.closeButton?.matches(":disabled")) return
    this.dispatchEvent(new CustomEvent<AlertCloseDetail>("mui:close", {
      bubbles: true, cancelable: true, detail: { originalEvent: event },
    }))
  }
}
