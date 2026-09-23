import { ViewElement } from "../core/index.js"
import { sanitizeHtml, type HtmlPolicy } from "../security/index.js"
import { requestHtml } from "../security/request.js"

export class AccordionItem extends ViewElement {
  public static readonly tag = "m-accordion-item"
  public connectedCallback(): void {
    if (this.querySelector(":scope > [data-m-header]") !== null) return
    const content = this.ownerDocument.createElement("div")
    content.dataset.mContent = ""
    while (this.firstChild !== null) content.append(this.firstChild)
    const button = this.ownerDocument.createElement("button")
    button.type = "button"
    button.dataset.mHeader = ""
    button.textContent = this.getAttribute("title") ?? ""
    const expanded = this.hasAttribute("open")
    content.hidden = !expanded
    button.setAttribute("aria-expanded", String(expanded))
    button.addEventListener("click", () => {
      content.hidden = !content.hidden
      button.setAttribute("aria-expanded", String(!content.hidden))
      this.toggleAttribute("open", !content.hidden)
    })
    this.append(button, content)
  }
}

export class Include extends ViewElement {
  public static readonly tag = "m-include"
  public static get observedAttributes(): string[] { return ["src"] }
  private controller: AbortController | undefined
  private active = false
  public get src(): string | null { return this.getAttribute("src") }
  public set src(value: string | null) { this.setStringAttribute("src", value) }
  public connectedCallback(): void { this.upgradeProperties(); this.active = true; void this.load() }
  public disconnectedCallback(): void {
    this.active = false
    this.controller?.abort()
    this.controller = undefined
    this.removeAttribute("loading")
  }
  public attributeChangedCallback(name: string, oldValue: string | null, value: string | null): void {
    if (name === "src" && oldValue !== value && this.active) void this.load()
  }
  public async load(): Promise<void> {
    this.controller?.abort()
    this.controller = undefined
    this.removeAttribute("loading")
    const src = this.src
    if (!src || !this.isConnected) return
    const policy: HtmlPolicy = { allowMarkupUI: true }
    const controller = this.controller = new AbortController()
    this.toggleAttribute("loading", true)
    try {
      const html = await requestHtml(src, this.ownerDocument, policy, controller.signal)
      if (this.controller !== controller || !this.isConnected) return
      this.replaceChildren(sanitizeHtml(html, this.ownerDocument, policy))
      this.emit("m:load", undefined)
    } catch (error) {
      if (this.controller === controller && this.isConnected && (error as Error).name !== "AbortError") this.emit("m:error", error)
    } finally {
      if (this.controller === controller) { this.controller = undefined; this.removeAttribute("loading") }
    }
  }
}
