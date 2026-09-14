import { ViewElement } from "../../core/index.js"

const inert = "template,script,style"

/**
 * A single item within a list, supporting optional prefix, suffix, and content regions.
 * @region {"name":"prefix","accepts":["icon","text","content"],"min":0,"max":1}
 * @region {"name":"content","accepts":["text","content","heading","phrasing"],"min":0,"max":1}
 * @region {"name":"suffix","accepts":["text","actions","controls"],"min":0,"max":1}
 */
export class ListItem extends ViewElement {
  public static readonly tag = "m-list-item"
  public static get observedAttributes(): string[] {
    return ["prefix", "suffix"]
  }

  private generatedPrefix: HTMLElement | undefined
  private generatedSuffix: HTMLElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "item"
    if (!this.hasAttribute("role")) this.setAttribute("role", "listitem")
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public override get prefix(): string | null {
    return this.getAttribute("prefix")
  }
  public override set prefix(value: string | null) {
    this.setStringAttribute("prefix", value)
  }

  public get suffix(): string | null {
    return this.getAttribute("suffix")
  }
  public set suffix(value: string | null) {
    this.setStringAttribute("suffix", value)
  }

  public get prefixRegion(): HTMLElement | null {
    const authored = this.findRegion("prefix")
    return authored ?? this.generatedPrefix ?? null
  }

  public get suffixRegion(): HTMLElement | null {
    const authored = this.findRegion("suffix")
    return authored ?? this.generatedSuffix ?? null
  }

  public get contentRegion(): HTMLElement | null {
    return this.findRegion("content")
  }

  public get rowRegion(): HTMLElement | null {
    return [...this.children].find((child): child is HTMLElement =>
      child instanceof HTMLElement && !child.matches(inert) && (
        child.matches("[data-part='row'], .m-list-row, .m-list-action")
      )
    ) ?? null
  }

  private findRegion(part: "prefix" | "suffix" | "content"): HTMLElement | null {
    const except = part === "prefix" ? this.generatedPrefix : part === "suffix" ? this.generatedSuffix : undefined
    const selector = `[data-part='${part}'], .m-list-${part}, m-list-${part}`
    const direct = [...this.children].find((child): child is HTMLElement =>
      child instanceof HTMLElement && child !== except && !child.matches(inert) && child.matches(selector)
    )
    if (direct) return direct
    const row = this.rowRegion
    if (row) {
      const nested = [...row.children].find((child): child is HTMLElement =>
        child instanceof HTMLElement && child !== except && !child.matches(inert) && child.matches(selector)
      )
      if (nested) return nested
    }
    return null
  }

  private synchronize(): void {
    this.observer?.disconnect()
    try {
      const authoredPrefix = this.findRegion("prefix")
      if (authoredPrefix && authoredPrefix !== this.generatedPrefix) {
        this.generatedPrefix?.remove()
        this.generatedPrefix = undefined
      } else if (this.prefix !== null) {
        if (!this.generatedPrefix) {
          this.generatedPrefix = this.ownerDocument.createElement("span")
          this.generatedPrefix.dataset.part = "prefix"
          this.generatedPrefix.className = "m-list-prefix"
          this.generatedPrefix.setAttribute("aria-hidden", "true")
          const target = this.rowRegion ?? this
          target.prepend(this.generatedPrefix)
        }
        if (this.generatedPrefix.textContent !== this.prefix) {
          this.generatedPrefix.textContent = this.prefix
        }
      } else {
        this.generatedPrefix?.remove()
        this.generatedPrefix = undefined
      }

      const authoredSuffix = this.findRegion("suffix")
      if (authoredSuffix && authoredSuffix !== this.generatedSuffix) {
        this.generatedSuffix?.remove()
        this.generatedSuffix = undefined
      } else if (this.suffix !== null) {
        if (!this.generatedSuffix) {
          this.generatedSuffix = this.ownerDocument.createElement("span")
          this.generatedSuffix.dataset.part = "suffix"
          this.generatedSuffix.className = "m-list-suffix"
          const target = this.rowRegion ?? this
          target.append(this.generatedSuffix)
        }
        if (this.generatedSuffix.textContent !== this.suffix) {
          this.generatedSuffix.textContent = this.suffix
        }
      } else {
        this.generatedSuffix?.remove()
        this.generatedSuffix = undefined
      }
    } finally {
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true, subtree: false })
      }
    }
  }
}
