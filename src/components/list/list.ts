import { ViewElement } from "../../core/index.js"
import { listSizes } from "./model.js"
import type { ListSize } from "./model.js"
import { ListItem } from "./item.js"

const inert = "template,script,style"

/**
 * A semantic list container with customizable size, borders, dividers, and optional header/footer regions.
 * @region {"name":"header","accepts":["heading","content"],"min":0,"max":1}
 * @region {"name":"items","accepts":["ListItem","native list"],"min":0,"max":null}
 * @region {"name":"footer","accepts":["content"],"min":0,"max":1}
 */
export class List extends ViewElement {
  public static readonly tag = "m-list"
  public static get observedAttributes(): string[] {
    return ["bordered", "size", "clickable", "hoverable", "show-divider"]
  }

  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "list"
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public get bordered(): boolean {
    return this.booleanAttribute("bordered", true)
  }
  public set bordered(value: boolean) {
    this.setBooleanAttribute("bordered", value, false)
  }

  public get size(): ListSize {
    return this.choiceAttribute("size", listSizes, "medium")
  }
  public set size(value: ListSize) {
    this.setChoiceAttribute("size", value, listSizes)
  }

  public get clickable(): boolean {
    return this.hasAttribute("clickable")
  }
  public set clickable(value: boolean) {
    this.setBooleanAttribute("clickable", value)
  }

  public get hoverable(): boolean {
    return this.hasAttribute("hoverable")
  }
  public set hoverable(value: boolean) {
    this.setBooleanAttribute("hoverable", value)
  }

  public get showDivider(): boolean {
    return this.booleanAttribute("show-divider", true)
  }
  public set showDivider(value: boolean) {
    this.setBooleanAttribute("show-divider", value, false)
  }

  public get header(): HTMLElement | null {
    return [...this.children].find((child): child is HTMLElement =>
      child instanceof HTMLElement && !child.matches(inert) && (
        child.matches("[data-part='header'], .m-list-header, m-list-header")
        || (child.localName === "header" && child.closest("m-list") === this)
      )
    ) ?? null
  }

  public get footer(): HTMLElement | null {
    return [...this.children].find((child): child is HTMLElement =>
      child instanceof HTMLElement && !child.matches(inert) && (
        child.matches("[data-part='footer'], .m-list-footer, m-list-footer")
        || (child.localName === "footer" && child.closest("m-list") === this)
      )
    ) ?? null
  }

  public get itemsContainer(): HTMLElement | null {
    return [...this.children].find((child): child is HTMLElement =>
      child instanceof HTMLElement && !child.matches(inert) && (
        child.matches("[data-part='items'], .m-list-items")
        || child.localName === "ul"
        || child.localName === "ol"
      )
    ) ?? null
  }

  public get items(): readonly ListItem[] {
    return Object.freeze(
      [...this.querySelectorAll<ListItem>("m-list-item")].filter(item =>
        item.closest("m-list") === this
      )
    )
  }

  public appendItem(item: ListItem | string): ListItem {
    const element = typeof item === "string" ? this.ownerDocument.createElement("m-list-item") as ListItem : item
    if (typeof item === "string") element.textContent = item
    const container = this.itemsContainer ?? this
    container.append(element)
    return element
  }

  public removeItem(item: ListItem): boolean {
    if (this.contains(item) && item.closest("m-list") === this) {
      item.remove()
      return true
    }
    return false
  }

  private synchronize(): void {
    this.observer?.disconnect()
    try {
      const container = this.itemsContainer
      if (container) {
        if (this.getAttribute("role") === "list") {
          this.removeAttribute("role")
        }
      } else {
        if (!this.hasAttribute("role")) {
          this.setAttribute("role", "list")
        }
      }
    } finally {
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true, subtree: false })
      }
    }
  }
}
