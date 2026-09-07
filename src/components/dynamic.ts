import { MuiElement } from "../core/element.js"
import { isSafeUri, sanitizeHtml, type HtmlPolicy } from "../security/index.js"

export class MuiAccordionItem extends MuiElement {
  public connectedCallback(): void {
    if (this.querySelector(":scope > [data-mui-header]") !== null) return
    const content = this.ownerDocument.createElement("div")
    content.dataset.muiContent = ""
    while (this.firstChild !== null) content.append(this.firstChild)
    const button = this.ownerDocument.createElement("button")
    button.type = "button"
    button.dataset.muiHeader = ""
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

export class MuiInclude extends MuiElement {
  public static get observedAttributes(): string[] { return ["src"] }
  private controller?: AbortController
  public connectedCallback(): void { void this.load() }
  public disconnectedCallback(): void { this.controller?.abort() }
  public attributeChangedCallback(name: string, oldValue: string | null, value: string | null): void {
    if (name === "src" && oldValue !== value && this.isConnected) void this.load()
  }
  public async load(): Promise<void> {
    const src = this.getAttribute("src")
    if (!src) return
    const policy: HtmlPolicy = { allowedOrigins: [location.origin] }
    if (!isSafeUri(src, policy)) {
      this.emit("error", new Error(`URL '${src}' is not allowed.`))
      return
    }
    this.controller?.abort()
    this.controller = new AbortController()
    this.toggleAttribute("loading", true)
    try {
      const response = await fetch(src, { signal: this.controller.signal })
      if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}.`)
      this.replaceChildren(sanitizeHtml(await response.text(), this.ownerDocument, policy))
      this.emit("load")
    } catch (error) {
      if ((error as Error).name !== "AbortError") this.emit("error", error)
    } finally {
      this.removeAttribute("loading")
    }
  }
}
