import { ViewElement } from "../core/index.js"
import { sanitizeHtml, type HtmlPolicy } from "../security/index.js"
import { requestHtml } from "../security/request.js"

export class AccordionItem extends ViewElement {
  public static readonly tag = "m-accordion-item"
  public static readonly observedAttributes = ["open", "title"]
  private button: HTMLButtonElement | undefined
  private content: HTMLDivElement | undefined
  private readonly toggle = () => { this.open = !this.open }
  public get open(): boolean { return this.hasAttribute("open") }
  public set open(value: boolean) { this.setBooleanAttribute("open", value) }
  public override get title(): string { return this.getAttribute("title") ?? "" }
  public override set title(value: string) {
    if (typeof value !== "string") throw new TypeError("Accordion title must be a string.")
    this.setAttribute("title", value)
  }
  public connectedCallback(): void {
    this.upgradeProperties()
    if (!this.content) {
      const content = this.content = this.ownerDocument.createElement("div")
      content.dataset.mContent = ""
      while (this.firstChild !== null) content.append(this.firstChild)
      const button = this.button = this.ownerDocument.createElement("button")
      button.type = "button"
      button.dataset.mHeader = ""
      this.append(button, content)
    }
    this.render()
    this.button!.addEventListener("click", this.toggle)
  }
  public disconnectedCallback(): void { this.button?.removeEventListener("click", this.toggle) }
  public attributeChangedCallback(): void { if (this.isConnected) this.render() }
  private render(): void {
    if (!this.content || !this.button) return
    this.content.hidden = !this.open
    this.button.setAttribute("aria-expanded", String(this.open))
    if (this.button.textContent !== this.title) this.button.textContent = this.title
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
