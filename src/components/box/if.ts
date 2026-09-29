import { ViewElement } from "../../core/index.js"

/**
 * Conditional content owned by an explicitly selected state binding.
 * @region {"name":"content","accepts":["one element"],"min":1,"max":1}
 */
export class If extends ViewElement {
  public static readonly tag = "m-if"
  private source: HTMLTemplateElement | undefined
  private prepared = false
  private upgraded = false
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    if (!this.prepared) {
      this.observer ??= new MutationObserver(() => this.capture())
      this.observer.observe(this, { childList: true })
      queueMicrotask(() => { if (this.isConnected) this.capture() })
    }
  }

  public disconnectedCallback(): void { this.observer?.disconnect() }

  /** Exact ID of a surviving focus owner inside the binding root; null requires another explicit policy. */
  public get focusTarget(): string | null { return this.getAttribute("focus-target") }
  public set focusTarget(value: string | null) {
    if (value !== null && (typeof value !== "string" || !value || /\s/.test(value))) {
      throw new TypeError("focus-target requires one nonempty ID.")
    }
    this.setStringAttribute("focus-target", value)
  }

  /** Web interoperability: inert source, not a rendered-content or store owner. */
  public get native(): HTMLTemplateElement {
    this.capture()
    if (this.source!.parentNode !== this) throw new TypeError("If renderer ownership changed.")
    const condition = this.getAttribute("data-if")
    if (condition === null) this.source!.removeAttribute("data-if")
    else if (this.source!.getAttribute("data-if") !== condition) this.source!.setAttribute("data-if", condition)
    this.prepared = true
    this.observer?.disconnect()
    return this.source!
  }

  private capture(): void {
    if (this.source) {
      if (!this.prepared && this.source.parentNode === this) {
        const incoming = [...this.childNodes].filter(node => node !== this.source)
        if (incoming.length) this.source.content.append(...incoming)
      }
      return
    }
    // Nested inert sources can clone captured chrome, but never live instances.
    const adopted = this.querySelector<HTMLTemplateElement>(":scope > template[data-if-source]")
    if (adopted && this.children.length === 1) this.source = adopted
    else {
      const source = this.ownerDocument.createElement("template")
      source.dataset.ifSource = ""
      source.content.append(...this.childNodes)
      this.source = source
      this.append(source)
    }
  }
}
