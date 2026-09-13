import { ViewElement } from "../../core/index.js"
import { DEFAULT_BREADCRUMB_SEPARATOR } from "./model.js"
import type { BreadcrumbItem } from "./item.js"

/**
 * Breadcrumb navigation container.
 * @region {"name":"items","element":"m-breadcrumb-item","accepts":["BreadcrumbItem"],"min":0,"max":null}
 */
export class Breadcrumb extends ViewElement {
  public static readonly tag = "m-breadcrumb"
  public static readonly observedAttributes = ["separator"]

  private initialized = false
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "breadcrumb"
    if (!this.hasAttribute("role")) this.setAttribute("role", "navigation")
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Breadcrumb")
    this.observer ??= new MutationObserver(() => this.updateSeparators())
    this.observer.observe(this, { childList: true })
    this.updateSeparators()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(name: string): void {
    if (this.initialized && this.isConnected && name === "separator") {
      this.updateSeparators()
    }
  }

  /**
   * The default separator string to display between items (defaults to "/").
   */
  public get separator(): string {
    return this.getAttribute("separator") ?? DEFAULT_BREADCRUMB_SEPARATOR
  }

  public set separator(value: string | null | undefined) {
    if (value == null) {
      this.removeAttribute("separator")
    } else {
      this.setAttribute("separator", String(value))
    }
  }

  public updateSeparators(): void {
    const items = this.querySelectorAll<BreadcrumbItem>("m-breadcrumb-item")
    for (const item of items) {
      if (typeof item.updateSeparator === "function") {
        item.updateSeparator()
      }
    }
  }
}
